import React from "react";

export type VideoProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "controls" | "preload" | "src"
> & {
  src: string | Blob | MediaSource | MediaStream;
  preload?: React.VideoHTMLAttributes<HTMLVideoElement>["preload"];
  showDownload?: boolean;
  downloadName?: string;
};

export function Video({ src, preload = "metadata", showDownload = false, downloadName, ...rest }: VideoProps) {
  const srcString = typeof src === "string" ? src : undefined;
  return (
    <div className="space-y-2">
      <video src={srcString} preload={preload} controls {...rest} />
      {showDownload && (
        <div>
          <a
            href={srcString ?? "#"}
            download={downloadName}
            className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700"
          >
            ダウンロード
          </a>
        </div>
      )}
    </div>
  );
}

export type AudioProps = Omit<
  React.AudioHTMLAttributes<HTMLAudioElement>,
  "controls" | "src"
> & {
  src: string | Blob | MediaSource | MediaStream;
  showDownload?: boolean;
  downloadName?: string;
};

export function Audio({ src, showDownload = false, downloadName, ...rest }: AudioProps) {
  const srcString = typeof src === "string" ? src : undefined;
  return (
    <div className="space-y-2">
      <audio src={srcString} controls preload="metadata" {...rest} />
      {showDownload && (
        <div>
          <a
            href={srcString ?? "#"}
            download={downloadName}
            className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700"
          >
            ダウンロード
          </a>
        </div>
      )}
    </div>
  );
}


