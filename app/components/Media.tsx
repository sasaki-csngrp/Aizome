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

/**
 * S3の直接URLをプロキシURLに変換
 * 例: https://aizome-xxx-1.s3.amazonaws.com/contents/videos/video006.mp4
 *  → /api/media/contents/videos/video006.mp4
 */
function convertS3UrlToProxyUrl(url: string): string {
  // S3のURLパターンを検出
  // パターン1: https://bucket-name.s3.amazonaws.com/path/to/file
  // パターン2: https://bucket-name.s3.region.amazonaws.com/path/to/file
  const s3Pattern = /https?:\/\/([^/]+)\.s3(?:\.([^.]+))?\.amazonaws\.com\/(.+)/;
  const match = url.match(s3Pattern);
  
  if (match) {
    // パス部分を抽出してプロキシURLに変換
    const path = match[3];
    return `/api/media/${path}`;
  }
  
  // S3のURLでない場合はそのまま返す
  return url;
}

export function Video({ src, preload = "metadata", showDownload = false, downloadName, ...rest }: VideoProps) {
  const srcString = typeof src === "string" ? convertS3UrlToProxyUrl(src) : undefined;
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
  const srcString = typeof src === "string" ? convertS3UrlToProxyUrl(src) : undefined;
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


