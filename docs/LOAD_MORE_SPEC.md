# 一覧画面「もっと見る」機能 実装仕様書

## 概要

レポート一覧・トレンド一覧・学習一覧の各ページにおいて、現在全件表示されているデータを
段階的に読み込む「もっと見る」機能を実装する。

- 初期表示: 一定件数のみ表示
- 「もっと見る」ボタンが画面内に入ったとき（スクロール到達時）に自動で追加読み込みを実行
- 追加データがなくなったらボタンを非表示にする

---

## 対象ページ

| ページ名     | ファイルパス                            | 初期表示件数 |
| ------------ | --------------------------------------- | ------------ |
| レポート一覧 | `app/(main)/reports/page.tsx`           | 9件          |
| トレンド一覧 | `app/(main)/trends/page.tsx`            | 9件          |
| 学習一覧     | `app/(main)/learnings/page.tsx`         | 10件         |

> グリッド3列のレポート・トレンドは3の倍数（9件）、学習はリスト形式のため10件を初期表示とする。

---

## アーキテクチャ方針

### 現状
```
Server Component (async)
  └─ DB全件取得
  └─ JSX全件レンダリング
```

### 変更後
```
Server Component (初期データのみ取得)
  └─ Client Component (LoadMoreList)
       ├─ 初期データ表示
       ├─ IntersectionObserver で「もっと見る」ボタンを監視
       └─ 画面内に入ったら fetch API を呼び出し追加データ取得
```

### ページネーション方式
**オフセットベース（LIMIT / OFFSET）** を採用する。

- シンプルで実装コストが低い
- データ件数が数百〜数千件規模であれば性能上の問題なし
- 既存のSQLクエリへの `LIMIT` / `OFFSET` 追加で対応可能

---

## 実装計画

### Step 1: DB層にページネーション対応クエリを追加

**ファイル**: `app/lib/db.ts`

各取得関数に `limit` / `offset` パラメータを追加する。既存の全件取得関数は変更せず、
新たにページネーション対応版を追加する。

```typescript
// レポート取得（ページネーション対応版）
export async function getReportsPaginated(
  limit: number,
  offset: number
): Promise<{ rows: Report[]; total: number }> {
  const { rows } = await sql<Report & { total_count: string }>`
    SELECT
      r.id, r.author_id,
      COALESCE(u.nickname, u.name, 'Unknown') as authorname,
      COALESCE(a.image_url, u.image) as "authorImage",
      r.title, r.content,
      r.created_at as "createdAt", r.updated_at as "updatedAt",
      r.type,
      (SELECT COUNT(*)::int FROM likes l WHERE l.report_id = r.id) AS "likeCount",
      COUNT(*) OVER() AS total_count
    FROM reports r
    JOIN users u ON r.author_id = u.id
    LEFT JOIN avatars a ON u.avatar_id = a.id
    WHERE r.type = 'report'
    ORDER BY r.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const total = rows.length > 0 ? parseInt(rows[0].total_count) : 0;
  return { rows, total };
}

// トレンド取得（ページネーション対応版）
export async function getTrendsPaginated(
  limit: number,
  offset: number
): Promise<{ rows: Report[]; total: number }> {
  // 同構造、WHERE r.type = 'trend'
}

// 学習コンテンツ取得（ページネーション対応版）
export async function getLearningContentsPaginated(
  limit: number,
  offset: number,
  userId?: string
): Promise<{ rows: LearningContent[]; total: number }> {
  // is_public フィルタ + ユーザーの学習済みフラグを維持しつつ LIMIT/OFFSET 追加
}
```

---

### Step 2: APIルートを追加（ページネーション対応）

**新規ファイル追加**:

| APIパス                        | ファイルパス                                          |
| ------------------------------ | ----------------------------------------------------- |
| `GET /api/reports?type=report&limit=9&offset=9` | `app/api/reports/route.ts`（GET追加）  |
| `GET /api/trends?limit=9&offset=9`              | `app/api/trends/route.ts`（新規）      |
| `GET /api/learnings?limit=10&offset=10`         | `app/api/learnings/route.ts`（GET修正）|

**レスポンス形式（統一）**:
```json
{
  "items": [...],
  "total": 42,
  "hasMore": true
}
```

**実装例（reports API GET）**:
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit  = Math.min(parseInt(searchParams.get('limit')  ?? '9'),  50);
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'),   0);

  const { rows, total } = await getReportsPaginated(limit, offset);

  return NextResponse.json({
    items: rows,
    total,
    hasMore: offset + rows.length < total,
  });
}
```

> セキュリティ: `limit` は最大50件に制限する。学習APIは認証済みユーザーのみ取得可能とする。

---

### Step 3: 汎用「もっと見る」Clientコンポーネントを作成

**新規ファイル**: `app/components/LoadMoreList.tsx`

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface LoadMoreListProps<T> {
  initialItems: T[];
  total: number;
  fetchMore: (offset: number) => Promise<{ items: T[]; hasMore: boolean }>;
  renderItem: (item: T) => React.ReactNode;
  pageSize: number;
  className?: string;
}

export default function LoadMoreList<T extends { id: string | number }>({
  initialItems,
  total,
  fetchMore,
  renderItem,
  pageSize,
  className,
}: LoadMoreListProps<T>) {
  const [items, setItems]     = useState<T[]>(initialItems);
  const [hasMore, setHasMore] = useState(items.length < total);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const result = await fetchMore(items.length);
    setItems((prev) => [...prev, ...result.items]);
    setHasMore(result.hasMore);
    setLoading(false);
  };

  // IntersectionObserver でボタンが画面内に入ったら自動読み込み
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '100px' }  // ボタンの100px手前で発火
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length, hasMore, loading]);

  return (
    <div>
      <div className={className}>
        {items.map((item) => renderItem(item))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg
                       hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? '読み込み中...' : 'もっと見る'}
          </button>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-muted-foreground mt-8 text-sm">
          全{items.length}件を表示しています
        </p>
      )}
    </div>
  );
}
```

---

### Step 4: 各ページに LoadMoreList を組み込む

#### 4-1. レポート一覧 (`app/(main)/reports/page.tsx`)

```tsx
// Server Component: 初期データのみ取得
export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  // 初期9件のみ取得
  const { rows: initialReports, total } = await getReportsPaginated(9, 0);

  return (
    <div>
      <ReportLoadMoreList
        initialItems={initialReports}
        total={total}
        currentUserId={currentUserId}
      />
    </div>
  );
}
```

**新規ファイル**: `app/components/ReportLoadMoreList.tsx`（Client Component）

```tsx
'use client';

import LoadMoreList from './LoadMoreList';
import ReportCard from './ReportCard';

export default function ReportLoadMoreList({ initialItems, total, currentUserId }) {
  const fetchMore = async (offset: number) => {
    const res = await fetch(`/api/reports?type=report&limit=9&offset=${offset}`);
    return res.json();
  };

  return (
    <LoadMoreList
      initialItems={initialItems}
      total={total}
      fetchMore={fetchMore}
      renderItem={(report) => (
        <ReportCard report={report} currentUserId={currentUserId} />
      )}
      pageSize={9}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    />
  );
}
```

#### 4-2. トレンド一覧 (`app/(main)/trends/page.tsx`)

レポート一覧と同パターン。`TrendLoadMoreList.tsx` を作成し、
`/api/trends?limit=9&offset=N` を呼び出す。

#### 4-3. 学習一覧 (`app/(main)/learnings/page.tsx`)

```tsx
// Server Component: 初期データのみ取得
export default async function LearningsPage() {
  const session = await getServerSession(authOptions);
  const { rows: initialContents, total } = await getLearningContentsPaginated(
    10, 0, session?.user?.id
  );

  return (
    <div>
      <h1>AI学習</h1>
      <LearningLoadMoreList initialItems={initialContents} total={total} />
    </div>
  );
}
```

**新規ファイル**: `app/components/LearningLoadMoreList.tsx`（Client Component）

`LearningList.tsx` の代替として機能する。既存の `LearningCard` コンポーネントをそのまま流用する。

---

### Step 5: ReportCard コンポーネントを抽出

現在 `reports/page.tsx` にインライン実装されているカード表示を `ReportCard.tsx` として分離する。
（LoadMoreList から renderItem 関数として渡すため）

**新規ファイル**: `app/components/ReportCard.tsx`

---

## ファイル変更・追加一覧

### 追加ファイル

| ファイルパス                                | 種別            | 内容                                        |
| ------------------------------------------- | --------------- | ------------------------------------------- |
| `app/components/LoadMoreList.tsx`           | Client Component | 汎用「もっと見る」コンポーネント            |
| `app/components/ReportCard.tsx`             | Component       | レポートカード表示（ページから抽出）        |
| `app/components/ReportLoadMoreList.tsx`     | Client Component | レポート用 LoadMoreList ラッパー            |
| `app/components/TrendLoadMoreList.tsx`      | Client Component | トレンド用 LoadMoreList ラッパー            |
| `app/components/LearningLoadMoreList.tsx`   | Client Component | 学習用 LoadMoreList ラッパー                |
| `app/api/trends/route.ts`                   | API Route       | トレンド一覧取得API（新規）                 |

### 変更ファイル

| ファイルパス                                | 変更内容                                              |
| ------------------------------------------- | ----------------------------------------------------- |
| `app/lib/db.ts`                             | ページネーション対応クエリ関数を追加                  |
| `app/lib/services.ts`                       | ページネーション対応サービス関数を追加                |
| `app/(main)/reports/page.tsx`               | 全件取得 → 初期9件取得 + ReportLoadMoreList に変更    |
| `app/(main)/trends/page.tsx`                | 全件取得 → 初期9件取得 + TrendLoadMoreList に変更     |
| `app/(main)/learnings/page.tsx`             | 全件取得 → 初期10件取得 + LearningLoadMoreList に変更 |
| `app/api/reports/route.ts`                  | GETハンドラを追加（ページネーション対応）             |
| `app/api/learnings/route.ts`                | GETハンドラをページネーション対応に修正               |

---

## 動作フロー

```
ユーザーがページを開く
  └─ Server Component: 初期N件取得 → Client Component に渡す
       └─ LoadMoreList: 初期データを表示
            └─ IntersectionObserver: 「もっと見る」ボタンを監視
                 └─ ボタンが画面内に入る or クリック
                      └─ fetch /api/... ?offset=N
                           └─ 取得データを既存リストに追加
                                └─ hasMore=false になったらボタン非表示
```

---

## 考慮事項

### パフォーマンス
- `COUNT(*) OVER()` ウィンドウ関数で総件数を1クエリで取得（追加クエリ不要）
- 初期データはSSRで取得するため、初回表示は現状と同等の速度を維持

### UX
- `rootMargin: '100px'` により、ボタンが画面に入る100px前から読み込みを開始
- `loading` 中はボタンを `disabled` にして連続クリックを防止
- `'読み込み中...'` テキストでフィードバック提供

### セキュリティ
- APIの `limit` 最大値を50件に制限（大量データ取得を防止）
- 学習APIは認証チェックを維持（既存の認証ロジックを踏襲）

### 後方互換性
- 既存の全件取得関数（`getAllReports`, `getTrends`, `getAllLearningContents`）は削除せず残す
- 既存の `LearningList.tsx` も当面は残す（段階的な移行）

---

## 実装順序（推奨）

1. `app/lib/db.ts` にページネーション対応クエリを追加・テスト
2. `app/api/reports/route.ts` に GETハンドラ追加
3. `app/api/trends/route.ts` 新規作成
4. `app/api/learnings/route.ts` GETハンドラ修正
5. `app/components/LoadMoreList.tsx` 汎用コンポーネント作成
6. `app/components/ReportCard.tsx` 抽出
7. レポート一覧ページに組み込み・動作確認
8. トレンド一覧ページに組み込み・動作確認
9. 学習一覧ページに組み込み・動作確認
