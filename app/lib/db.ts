import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import { NewReport, Report, User, Avatar, LearningContent, NewLearningContent, UserLearnedContent, Quest, UserClearedQuest } from './models';

export async function insertReport(report: NewReport): Promise<Report> {
  try {
    const result = await sql<Report>`
      INSERT INTO reports (author_id, title, content, type)
      VALUES (${report.author_id}, ${report.title}, ${report.content}, ${report.type})
      RETURNING id, author_id, title, content, created_at as "createdAt", updated_at as "updatedAt", type;
    `;
    // The `sql` function returns an object with a `rows` array.
    // We expect only one row to be returned for an INSERT with RETURNING.
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error('Failed to insert report: No rows returned.');
    }
  } catch (error) {
    console.error('Error inserting report:', error);
    throw new Error('Failed to insert report into database.');
  }
}

export async function getAllReportsFromDb(): Promise<Report[]> {
  try {
    const { rows } = await sql<Report>`
      SELECT
        r.id,
        r.author_id,
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        r.title,
        r.content,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type,
        (SELECT COUNT(*)::int FROM likes l WHERE l.report_id = r.id) AS "likeCount"
      FROM reports r
      JOIN users u ON r.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
      WHERE r.type = 'report'
      ORDER BY r.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reports.');
  }
}

export async function getTrendsFromDb(): Promise<Report[]> {
  try {
    const { rows } = await sql<Report>`
      SELECT
        r.id,
        r.author_id,
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        r.title,
        r.content,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type,
        (SELECT COUNT(*)::int FROM likes l WHERE l.report_id = r.id) AS "likeCount"
      FROM reports r
      JOIN users u ON r.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
      WHERE r.type = 'trend'
      ORDER BY r.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch trends.');
  }
}

export async function deleteReportById(id: string) {
  noStore();
  try {
    await sql`DELETE FROM reports WHERE id = ${id}`;
    return { message: 'Report deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete report.');
  }
}

export async function getReportByIdFromDb(id: string): Promise<Report | null> {
  try {
    const { rows } = await sql<Report>`
      SELECT
        r.id,
        r.author_id,
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        r.title,
        r.content,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type,
        (SELECT COUNT(*)::int FROM likes l WHERE l.report_id = r.id) AS "likeCount"
      FROM reports r
      JOIN users u ON r.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
      WHERE r.id = ${id}
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching report by ID from DB:', error);
    throw new Error('Failed to fetch report by ID from database.');
  }
}

export async function updateReportInDb(report: Report): Promise<Report> {
  try {
    const result = await sql<Report>`
      UPDATE reports
      SET title = ${report.title}, content = ${report.content}, type = ${report.type}, updated_at = NOW()
      WHERE id = ${report.id}
      RETURNING id, author_id, title, content, created_at as "createdAt", updated_at as "updatedAt", type;
    `;
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error('Failed to update report: No rows returned.');
    }
  } catch (error) {
    console.error('Error updating report in DB:', error);
    throw new Error('Failed to update report in database.');
  }
}

export async function getAvatarsFromDb(): Promise<Avatar[]> {
  noStore(); // Prevent caching
  try {
    const { rows } = await sql<Avatar>`
      SELECT id, name, image_url FROM avatars ORDER BY id ASC;
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch avatars.');
  }
}

export async function getUserByIdFromDb(id: string): Promise<User | null> {
  noStore(); // Prevent caching
  try {
    const { rows } = await sql<User>`
      SELECT
        id,
        name,
        email,
        "emailVerified",
        image,
        "hashedPassword",
        nickname,
        bio,
        total_points,
        avatar_id,
        created_at,
        updated_at
      FROM users
      WHERE id = ${id};
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user by ID.');
  }
}

export async function updateUserInDb(id: string, data: Partial<User>): Promise<User> {
  noStore(); // Prevent caching
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (data.nickname !== undefined) {
      updates.push(`nickname = $${paramIndex++}`);
      values.push(data.nickname);
    }
    if (data.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(data.bio);
    }
    if (data.avatar_id !== undefined) {
      updates.push(`avatar_id = $${paramIndex++}`);
      values.push(data.avatar_id);
    }

    if (updates.length === 0) {
      // 更新するフィールドがない場合は、データベースにアクセスせずにユーザー情報を返します。
      const user = await getUserByIdFromDb(id);
      if (!user) throw new Error("User not found after attempting an empty update.");
      return user;
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, "emailVerified", image, "hashedPassword", nickname, bio,
total_points, avatar_id, created_at, updated_at;
    `;

    values.push(id);

    const result = await sql.query<User>(query, values);

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error('Failed to update user: No rows returned.');
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update user in database.');
  }
}

export async function getReportsByUserIdFromDb(userId: string): Promise<Report[]> {
  try {
    const { rows } = await sql<Report>`
      SELECT
        r.id,
        r.author_id,
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        r.title,
        r.content,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type,
        (SELECT COUNT(*)::int FROM likes l WHERE l.report_id = r.id) AS "likeCount"
      FROM reports r
      JOIN users u ON r.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
      WHERE r.author_id = ${userId} AND r.type = 'report'
      ORDER BY r.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reports by user.');
  }
}

export async function getLikeCountFromDb(reportId: string): Promise<number> {
  try {
    const { rows } = await sql<{ likeCount: number }>`
      SELECT COUNT(*)::int as "likeCount" FROM likes WHERE report_id = ${reportId}
    `;
    return rows[0]?.likeCount ?? 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch like count.');
  }
}

export async function isReportLikedByUserFromDb(reportId: string, userId: string): Promise<boolean> {
  try {
    const { rows } = await sql<{ exists: boolean }>`
      SELECT EXISTS (
        SELECT 1 FROM likes WHERE report_id = ${reportId} AND user_id = ${userId}
      ) as exists
    `;
    return rows[0]?.exists ?? false;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check like status.');
  }
}

export async function addLikeToDb(reportId: string, userId: string): Promise<void> {
  try {
    await sql`INSERT INTO likes (report_id, user_id) VALUES (${reportId}, ${userId}) ON CONFLICT (user_id, report_id) DO NOTHING`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add like.');
  }
}

export async function removeLikeFromDb(reportId: string, userId: string): Promise<void> {
  try {
    await sql`DELETE FROM likes WHERE report_id = ${reportId} AND user_id = ${userId}`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to remove like.');
  }
}

// Learning Content Database Functions
export async function insertLearningContent(learningContent: NewLearningContent): Promise<LearningContent> {
  try {
    const result = await sql<LearningContent>`
      INSERT INTO learning_contents (author_id, title, content, question, answer, difficulty, prerequisite_content_id, is_public)
      VALUES (${learningContent.author_id}, ${learningContent.title}, ${learningContent.content}, ${learningContent.question}, ${learningContent.answer}, ${learningContent.difficulty}, ${learningContent.prerequisite_content_id}, ${learningContent.is_public || false})
      RETURNING id, author_id, title, content, question, answer, difficulty, prerequisite_content_id, is_public, created_at, updated_at;
    `;
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error('Failed to insert learning content: No rows returned.');
    }
  } catch (error) {
    console.error('Error inserting learning content:', error);
    throw new Error('Failed to insert learning content into database.');
  }
}

export async function getAllLearningContentsFromDb(): Promise<LearningContent[]> {
  try {
    const { rows } = await sql<LearningContent>`
      SELECT
        lc.id,
        lc.author_id,
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        lc.title,
        lc.content,
        lc.question,
        lc.answer,
        lc.difficulty,
        lc.prerequisite_content_id,
        lc.is_public,
        lc.created_at,
        lc.updated_at
      FROM learning_contents lc
      JOIN users u ON lc.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
      ORDER BY lc.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch learning contents.');
  }
}

export async function getLearningContentByIdFromDb(id: string): Promise<LearningContent | null> {
  try {
    const { rows } = await sql<LearningContent>`
      SELECT
        lc.id,
        lc.author_id,
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        lc.title,
        lc.content,
        lc.question,
        lc.answer,
        lc.difficulty,
        lc.prerequisite_content_id,
        lc.is_public,
        lc.created_at,
        lc.updated_at
      FROM learning_contents lc
      JOIN users u ON lc.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
      WHERE lc.id = ${id}
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching learning content by ID from DB:', error);
    throw new Error('Failed to fetch learning content by ID from database.');
  }
}

export async function updateLearningContentInDb(learningContent: LearningContent): Promise<LearningContent> {
  try {
    const result = await sql<LearningContent>`
      UPDATE learning_contents
      SET title = ${learningContent.title}, content = ${learningContent.content}, question = ${learningContent.question}, answer = ${learningContent.answer}, difficulty = ${learningContent.difficulty}, prerequisite_content_id = ${learningContent.prerequisite_content_id}, is_public = ${learningContent.is_public}, updated_at = NOW()
      WHERE id = ${learningContent.id}
      RETURNING id, author_id, title, content, question, answer, difficulty, prerequisite_content_id, is_public, created_at, updated_at;
    `;
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error('Failed to update learning content: No rows returned.');
    }
  } catch (error) {
    console.error('Error updating learning content in DB:', error);
    throw new Error('Failed to update learning content in database.');
  }
}

export async function deleteLearningContentById(id: string) {
  noStore();
  try {
    await sql`DELETE FROM learning_contents WHERE id = ${id}`;
    return { message: 'Learning content deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete learning content.');
  }
}

// User Learning Content Database Functions
export async function getUserLearnedContentIdsFromDb(userId: string): Promise<string[]> {
  try {
    const { rows } = await sql<{ content_id: string }>`
      SELECT content_id FROM user_learned_contents WHERE user_id = ${userId}
    `;
    return rows.map(row => row.content_id);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user learned content IDs.');
  }
}

export async function insertUserLearnedContentToDb(userId: string, contentId: string): Promise<void> {
  try {
    await sql`
      INSERT INTO user_learned_contents (user_id, content_id) 
      VALUES (${userId}, ${contentId}) 
      ON CONFLICT (user_id, content_id) DO NOTHING
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to insert user learned content.');
  }
}

export async function getAvailableLearningContentsFromDb(userId: string): Promise<LearningContent[]> {
  try {
    const { rows } = await sql<LearningContent & { is_learned: boolean }>`
      SELECT
        lc.id,
        lc.author_id,
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        lc.title,
        lc.content,
        lc.question,
        lc.answer,
        lc.difficulty,
        lc.prerequisite_content_id,
        lc.is_public,
        lc.created_at,
        lc.updated_at,
        CASE 
          WHEN ulc.content_id IS NOT NULL THEN true 
          ELSE false 
        END as is_learned
      FROM learning_contents lc
      JOIN users u ON lc.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
      LEFT JOIN user_learned_contents ulc ON lc.id = ulc.content_id AND ulc.user_id = ${userId}
      WHERE lc.is_public = true
        AND (
          lc.prerequisite_content_id IS NULL 
          OR lc.prerequisite_content_id IN (
            SELECT content_id FROM user_learned_contents WHERE user_id = ${userId}
          )
        )
      ORDER BY lc.difficulty ASC, lc.created_at ASC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch available learning contents.');
  }
}

// Quest Database Functions
export async function getQuestsFromDb(): Promise<Quest[]> {
  try {
    const { rows } = await sql<Quest>`
      SELECT 
        id,
        title,
        description,
        category,
        points,
        trigger_event,
        target_id,
        is_active,
        created_at,
        updated_at
      FROM quests 
      WHERE is_active = true
      ORDER BY 
        CASE category 
          WHEN 'tutorial' THEN 1
          WHEN 'daily' THEN 2
          WHEN 'weekly' THEN 3
          WHEN 'learning' THEN 4
        END,
        points ASC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch quests.');
  }
}

export async function getUserClearedQuestsFromDb(userId: string): Promise<UserClearedQuest[]> {
  try {
    const { rows } = await sql<UserClearedQuest>`
      SELECT 
        user_id,
        quest_id,
        cleared_at
      FROM user_cleared_quests 
      WHERE user_id = ${userId}
      ORDER BY cleared_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user cleared quests.');
  }
}

export async function insertUserClearedQuestToDb(userId: string, questId: string): Promise<void> {
  try {
    await sql`
      INSERT INTO user_cleared_quests (user_id, quest_id) 
      VALUES (${userId}, ${questId}) 
      ON CONFLICT (user_id, quest_id, cleared_at) DO NOTHING
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to insert user cleared quest.');
  }
}