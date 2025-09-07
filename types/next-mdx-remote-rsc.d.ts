declare module "next-mdx-remote/rsc" {
  import * as React from "react";

  export interface CompileMDXOptions {
    source: string;
    components?: Record<string, React.ComponentType<any>>;
    options?: {
      mdxOptions?: any;
    };
  }

  export function compileMDX(options: CompileMDXOptions): Promise<{
    content: React.ReactNode;
    frontmatter: Record<string, any>;
  }>;

  export type MDXComponents = Record<string, React.ComponentType<any>>;
}


