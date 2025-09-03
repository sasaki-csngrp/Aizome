import MarkdownRenderer from "../components/MarkdownRenderer"

const sampleMarkdown = `
# 見出し H1

## 見出し H2

通常の段落テキストです。**太字** や *斜体* もOK。

- リスト1
- リスト2
- [リンク](https://example.com)

\`\`\`js
// コードブロック
function hello() {
  console.log("Hello, Markdown + Tailwind v4!");
}
\`\`\`

| 列1 | 列2 |
| --- | --- |
| A   | B   |
| C   | D   |
`

export default function Page() {
  return (
    <main className="p-8 space-y-8">
      {/* 通常の Tailwind 表現 */}
      <div className="bg-brand text-white p-4 rounded-xl">
        これは通常の Tailwind ユーティリティで作ったボックスです
      </div>

      {/* Markdown 表現 */}
      <MarkdownRenderer content={sampleMarkdown} />
    </main>
  )
}