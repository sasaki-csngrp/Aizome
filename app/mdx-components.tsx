import type { MDXComponents } from "next-mdx-remote/rsc";
import { Video, Audio } from "./components/Media";
import CodeBlockClient from "./components/CodeBlockClient";
import React from "react";

type CodeProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  children?: React.ReactNode;
};

export function getMDXComponents(components: MDXComponents): MDXComponents {
  const merged: MDXComponents = {
    ...components,
    Video,
    Audio,
    code: (props: CodeProps) => {
      const className: string | undefined = props?.className;
      const match = /language-(\w+)/.exec(className || "");
      const code: string = String(props?.children ?? "").replace(/\n$/, "");
      if (match) {
        return (
          <CodeBlockClient
            language={match[1]}
            code={code}
            className="rounded-md"
          />
        );
      }
      return <code className={className}>{props.children}</code>;
    },
  };
  return merged;
}


