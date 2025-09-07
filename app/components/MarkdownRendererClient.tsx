"use client"

import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import CodeBlockClient from "./CodeBlockClient";
import { Video as VideoComp, Audio as AudioComp } from "./Media";

type Props = {
  content: string;
};

type CodeProps = React.HTMLAttributes<HTMLElement> & {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function MarkdownRendererClient({ content }: Props) {
  const VideoRenderer: Components["video"] = (props) => {
    const { src, ...rest } = (props as unknown) as React.DetailedHTMLProps<
      React.VideoHTMLAttributes<HTMLVideoElement>,
      HTMLVideoElement
    >;
    const dict = (props as unknown) as Record<string, unknown>;
    const dataDownloadRaw = dict["data-aizome-download"] ?? dict["data-download"];
    const showDownload = dataDownloadRaw === "" || dataDownloadRaw === true || dataDownloadRaw === "true";
    const downloadNameRaw = dict["data-aizome-download-name"] ?? dict["data-download-name"];
    const downloadName = typeof downloadNameRaw === "string" ? downloadNameRaw : undefined;
    if (typeof src !== "string") return <video {...(rest as React.VideoHTMLAttributes<HTMLVideoElement>)} />;
    return (
      <VideoComp
        src={src as string}
        showDownload={showDownload}
        downloadName={downloadName}
        {...(rest as React.VideoHTMLAttributes<HTMLVideoElement>)}
      />
    );
  };

  const AudioRenderer: Components["audio"] = (props) => {
    const { src, ...rest } = (props as unknown) as React.DetailedHTMLProps<
      React.AudioHTMLAttributes<HTMLAudioElement>,
      HTMLAudioElement
    >;
    const dict = (props as unknown) as Record<string, unknown>;
    const dataDownloadRaw = dict["data-aizome-download"] ?? dict["data-download"];
    const showDownload = dataDownloadRaw === "" || dataDownloadRaw === true || dataDownloadRaw === "true";
    const downloadNameRaw = dict["data-aizome-download-name"] ?? dict["data-download-name"];
    const downloadName = typeof downloadNameRaw === "string" ? downloadNameRaw : undefined;
    if (typeof src !== "string") return <audio {...(rest as React.AudioHTMLAttributes<HTMLAudioElement>)} />;
    return (
      <AudioComp
        src={src as string}
        showDownload={showDownload}
        downloadName={downloadName}
        {...(rest as React.AudioHTMLAttributes<HTMLAudioElement>)}
      />
    );
  };

  const transformed = transformMdxMediaToHtml(content);
  return (
    <div className="prose prose-aizome max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            if (!inline && match) {
              return (
                <CodeBlockClient
                  language={match[1]}
                  code={codeString}
                  className="rounded-md"
                />
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          video: VideoRenderer,
          audio: AudioRenderer,
        }}
      >
        {transformed}
      </ReactMarkdown>
    </div>
  );
}

// Very small pre-transformer: convert MDX-style <Video .../> and <Audio .../>
// into HTML <video .../> and <audio .../> with data attributes for download options.
function transformMdxMediaToHtml(input: string): string {
  let out = input;
  // <Video ... /> -> <video ... data-...></video>
  out = out.replace(/<Video([^>]*)\/>/g, (_m, attrs: string) => {
    let a = attrs as string;
    // showDownload (bool attr)
    if (/\bshowDownload\b/.test(a)) {
      a = a.replace(/\bshowDownload\b(?:=\{?true\}?)?/g, "");
      a += ' data-aizome-download="true"';
    }
    // downloadName
    a = a.replace(/\s+downloadName="([^"]+)"/g, ' data-aizome-download-name="$1"');
    return `<video${a.trim()}></video>`;
  });
  // <Audio ... /> -> <audio ... data-...></audio>
  out = out.replace(/<Audio([^>]*)\/>/g, (_m, attrs: string) => {
    let a = attrs as string;
    if (/\bshowDownload\b/.test(a)) {
      a = a.replace(/\bshowDownload\b(?:=\{?true\}?)?/g, "");
      a += ' data-aizome-download="true"';
    }
    a = a.replace(/\s+downloadName="([^"]+)"/g, ' data-aizome-download-name="$1"');
    return `<audio${a.trim()}></audio>`;
  });
  return out;
}


