import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getMDXComponents } from "../mdx-components";

export default async function MarkdownRenderer({ content }: { content: string }) {
  const { content: MDXContent } = await compileMDX({
    source: content,
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
