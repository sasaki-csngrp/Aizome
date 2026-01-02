import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getMDXComponents } from "../mdx-components";

// MDXコンパイル前に、自己終了タグを正規化する
// <br>を<br />に変換してMDXの構文エラーを防ぐ
function normalizeSelfClosingTags(content: string): string {
  // <br>を<br />に変換（既に<br />の場合はそのまま）
  return content.replace(/<br\s*(?![\/])>/gi, "<br />");
}

export default async function MarkdownRenderer({ content }: { content: string }) {
  // MDXコンパイル前に自己終了タグを正規化
  const normalizedContent = normalizeSelfClosingTags(content);
  
  const { content: MDXContent } = await compileMDX({
    source: normalizedContent,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
    components: getMDXComponents({}),
  });

  return (
    <div className="prose prose-aizome max-w-none">
      {MDXContent}
    </div>
  );
}
