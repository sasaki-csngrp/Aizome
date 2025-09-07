"use client"

import { useState, type CSSProperties } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

type CodeBlockClientProps = {
  language?: string;
  code: string;
  className?: string;
};

export default function CodeBlockClient({ language, code, className }: CodeBlockClientProps) {
  const [isCopied, setIsCopied] = useState(false);
  const prismTheme = vscDarkPlus as Record<string, CSSProperties>;

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <div className="relative not-prose">
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 z-10 inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-gray-800/50 rounded-md hover:text-white hover:bg-gray-700/70"
        aria-label="Copy code"
      >
        {isCopied ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      <SyntaxHighlighter
        style={prismTheme}
        language={language}
        PreTag="div"
        className={className ?? "rounded-md"}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}


