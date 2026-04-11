# トレンド画面 マークダウン対応 実装プラン

## 1. 現状分析

### 1.1 レポート画面（マークダウン対応済み）

#### 詳細ページ (`app/(main)/reports/[id]/page.tsx`)
- **サーバーコンポーネント**
- `MarkdownRenderer`（`app/components/MarkdownRenderer.tsx`）を使用
- `next-mdx-remote/rsc` の `compileMDX` + `remark-gfm` でサーバーサイドレンダリング
- Video・Audio・コードブロック（シンタックスハイライト）に対応

#### 編集フォームのプレビュー (`app/components/ReportForm.tsx`)
- **クライアントコンポーネント**
- `MarkdownRendererClient`（`app/components/MarkdownRendererClient.tsx`）を使用
- `react-markdown` + `remark-gfm` + `rehype-raw` でクライアントサイドレンダリング
- 同じく Video・Audio・コードブロックに対応

### 1.2 トレンド画面（マークダウン未対応）

#### 一覧カード (`app/components/TrendCard.tsx`)
- **クライアントコンポーネント**
- `ContentWithLinks` を使用（URLをリンク化するのみ）
- マークダウン記法（見出し・太字・コードブロック等）は解釈されず生テキスト表示

#### 詳細ページ (`app/(main)/trends/[id]/page.tsx`)
- **クライアントコンポーネント**（`'use client'`）
- `ContentWithLinks` を使用
- `whitespace-pre-wrap` で改行のみ保持
- マークダウン記法は解釈されず生テキスト表示

### 1.3 なぜクライアントコンポーネントか
トレンド詳細ページは以下の理由でクライアントコンポーネントになっている：
- `useState` / `useEffect` でAPIフェッチ（`/api/reports/${trendId}`）
- クエストクリアチェック（`/api/checkClearQuest`）のPOST処理

---

## 2. 変更対象ファイル

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `app/(main)/trends/[id]/page.tsx` | **修正** | `ContentWithLinks` → `MarkdownRendererClient` に置き換え |
| `app/components/TrendCard.tsx` | **修正** | `ContentWithLinks` → マークダウンのプレーンテキスト変換に変更 |

---

## 3. 実装詳細

### 3.1 トレンド詳細ページのマークダウン対応

**ファイル:** `app/(main)/trends/[id]/page.tsx`

**変更前:**
```tsx
import ContentWithLinks from '@/app/components/ContentWithLinks';

// ...（省略）

<div className="prose max-w-none">
  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
    <ContentWithLinks content={trend.content} />
  </div>
</div>
```

**変更後:**
```tsx
import MarkdownRendererClient from '@/app/components/MarkdownRendererClient';

// ...（省略）

<div>
  <MarkdownRendererClient content={trend.content} />
</div>
```

**ポイント:**
- `MarkdownRendererClient` は既に `'use client'` の クライアントコンポーネントであり、クライアントコンポーネントであるトレンド詳細ページから問題なく利用できる
- `MarkdownRendererClient` 自体が `<div className="prose prose-aizome max-w-none">` でラップしているため、外側の `prose` クラスの二重適用を避ける
- `whitespace-pre-wrap` は `MarkdownRendererClient` がマークダウンの改行を適切に処理するため不要になる
- `ContentWithLinks` のインポートも削除する

### 3.2 トレンドカード（一覧）のプレビュー対応

**ファイル:** `app/components/TrendCard.tsx`

一覧カードでは本文の先頭3行程度を **プレビュー表示** するだけであり、完全なマークダウンレンダリングは不要。  
また、カードは`Link`でラップされているため、内部に`<h1>`や`<p>`等のブロック要素を入れるとHTMLの入れ子ルール違反になるリスクがある。

**方針:** マークダウン記法を **ストリップ（除去）してプレーンテキスト化** してからプレビューに表示する。

**変更前:**
```tsx
import ContentWithLinks from '@/app/components/ContentWithLinks';

<Link href={`/trends/${trend.id}`} className="text-gray-700 mb-4 line-clamp-3 flex-grow hover:text-blue-600 transition-colors">
  <ContentWithLinks content={trend.content} />
</Link>
```

**変更後:**
```tsx
// ContentWithLinks のインポートを削除し、stripMarkdown ユーティリティを利用

<Link href={`/trends/${trend.id}`} className="text-gray-700 mb-4 line-clamp-3 flex-grow hover:text-blue-600 transition-colors">
  {stripMarkdown(trend.content)}
</Link>
```

**`stripMarkdown` 関数の実装場所:**  
`app/lib/utils.ts`（既存のユーティリティファイル）に追加する。

```ts
/**
 * マークダウン記法を除去してプレーンテキストに変換する。
 * 一覧カードのプレビュー表示に使用する。
 */
export function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, '')      // コードブロック
    .replace(/`[^`]*`/g, '')             // インラインコード
    .replace(/!\[.*?\]\(.*?\)/g, '')     // 画像
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // リンク（テキストのみ残す）
    .replace(/^#{1,6}\s+/gm, '')         // 見出し
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // 太字
    .replace(/(\*|_)(.*?)\1/g, '$2')    // 斜体
    .replace(/~~(.*?)~~/g, '$1')         // 取り消し線
    .replace(/^>\s+/gm, '')              // 引用
    .replace(/^[-*+]\s+/gm, '')          // 箇条書き
    .replace(/^\d+\.\s+/gm, '')          // 番号付きリスト
    .replace(/\n{2,}/g, ' ')             // 連続改行をスペースに
    .replace(/\n/g, ' ')                 // 残りの改行をスペースに
    .trim();
}
```

---

## 4. 影響範囲の確認

### 変更しないもの
- `ContentWithLinks`（他で使われている可能性があるため削除しない）
- `MarkdownRendererClient`（既存のまま使用）
- `MarkdownRenderer`（サーバーコンポーネント、レポート側で引き続き使用）
- APIルート（変更なし）

### スタイルへの影響
- `MarkdownRendererClient` は `prose prose-aizome max-w-none` クラスを内包しており、レポート詳細と同様のスタイルが適用される
- Tailwind CSS の `@tailwindcss/typography` プラグインが既に導入されているため、追加のインストールは不要

---

## 5. 実装手順

1. **`app/lib/utils.ts`** に `stripMarkdown` 関数を追加する
2. **`app/components/TrendCard.tsx`** を修正する
   - `ContentWithLinks` のインポートを削除
   - プレビューテキストに `stripMarkdown` を適用
3. **`app/(main)/trends/[id]/page.tsx`** を修正する
   - `ContentWithLinks` のインポートを削除
   - `MarkdownRendererClient` をインポート
   - 本文表示部を `MarkdownRendererClient` に置き換え
   - 不要になった `whitespace-pre-wrap` のラッパー `div` を整理

---

## 6. 動作確認ポイント

- [ ] トレンド詳細ページで見出し（`#`, `##`）が正しく表示される
- [ ] トレンド詳細ページで太字・斜体・取り消し線が正しく表示される
- [ ] トレンド詳細ページでコードブロックにシンタックスハイライトが適用される
- [ ] トレンド詳細ページでURLがリンクとして表示される（`remark-gfm` の autolink 機能）
- [ ] トレンド詳細ページで Video・Audio タグが正しく動作する
- [ ] トレンド一覧カードでマークダウン記法が除去されてプレーンテキストで表示される
- [ ] トレンド一覧カードで `line-clamp-3` による3行省略が正常に機能する
- [ ] レポート画面の表示が変わっていないこと（デグレなし）
