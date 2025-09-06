import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trigger_event, target_id } = await request.json();

    if (!trigger_event) {
      return NextResponse.json({ error: 'trigger_event is required' }, { status: 400 });
    }

    // クリア対象のクエストを取得
    const questRows = [];
    
    if (trigger_event === 'content_learned') {
      // 学習コンテンツ正解時は、チュートリアルクエストと学習クエストの両方をチェック
      
      // 1. チュートリアルクエスト（target_id なし）
      const tutorialQuery = sql`
        SELECT id FROM quests 
        WHERE trigger_event = ${trigger_event} 
        AND category = 'tutorial'
        AND is_active = true
      `;
      const tutorialResult = await tutorialQuery;
      questRows.push(...tutorialResult.rows);
      
      // 2. 学習クエスト（target_id あり、かつ指定されたtarget_idと一致）
      if (target_id) {
        const learningQuery = sql`
          SELECT id FROM quests 
          WHERE trigger_event = ${trigger_event} 
          AND category = 'learning'
          AND target_id = ${target_id}
          AND is_active = true
        `;
        const learningResult = await learningQuery;
        questRows.push(...learningResult.rows);
      }
    } else {
      // その他のクエストは trigger_event のみで判定
      const otherQuery = sql`
        SELECT id FROM quests 
        WHERE trigger_event = ${trigger_event} 
        AND is_active = true
      `;
      const otherResult = await otherQuery;
      questRows.push(...otherResult.rows);
    }
    
    if (questRows.length === 0) {
      return NextResponse.json({ points: 0 });
    }

    const questIds = questRows.map(row => row.id);

    // 既にクリア済みのクエストを除外
    const clearedQuestIds = new Set<string>();
    for (const questId of questIds) {
      const { rows: clearedRows } = await sql`
        SELECT quest_id FROM user_cleared_quests 
        WHERE user_id = ${session.user.id} 
        AND quest_id = ${questId}
      `;
      if (clearedRows.length > 0) {
        clearedQuestIds.add(questId);
      }
    }
    
    const newQuestIds = questIds.filter(id => !clearedQuestIds.has(id));

    if (newQuestIds.length === 0) {
      return NextResponse.json({ points: 0 });
    }

    // クエストクリアとポイント更新処理
    let totalPoints = 0;
    
    // 各クエストのポイントを取得
    for (const questId of newQuestIds) {
      const questResult = await sql`
        SELECT points FROM quests WHERE id = ${questId}
      `;
      if (questResult.rows.length > 0) {
        totalPoints += questResult.rows[0].points;
      }
    }
    
    // クエストクリア記録を追加
    for (const questId of newQuestIds) {
      await sql`
        INSERT INTO user_cleared_quests (user_id, quest_id) 
        VALUES (${session.user.id}, ${questId}) 
        ON CONFLICT (user_id, quest_id, cleared_at) DO NOTHING
      `;
    }
    
    // ユーザーのポイントを更新
    if (totalPoints > 0) {
      await sql`
        UPDATE users 
        SET total_points = COALESCE(total_points, 0) + ${totalPoints}
        WHERE id = ${session.user.id}
      `;
    }

    return NextResponse.json({ points: totalPoints });

  } catch (error) {
    console.error('Error in checkClearQuest API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
