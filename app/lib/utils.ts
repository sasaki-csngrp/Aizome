export function formatDateToYYYYMMDD(dateString: string | Date): string {
  if (!dateString) return 'N/A';
  try {
    // toLocaleDateString は、ja-JPロケールで YYYY/MM/DD 形式の文字列を返す
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Tokyo',
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * マークダウン記法を除去してプレーンテキストに変換する。
 * 一覧カードのプレビュー表示に使用する。
 */
export function stripMarkdown(content: string): string {
  // URLをプレースホルダーで保護してからMarkdown除去を行う
  const urls: string[] = [];
  const protected_ = content.replace(/(https?:\/\/[^\s]+)/g, (url) => {
    urls.push(url);
    return `\x00URL${urls.length - 1}\x00`;
  });

  const stripped = protected_
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();

  // URLを復元する
  return stripped.replace(/\x00URL(\d+)\x00/g, (_, i) => urls[parseInt(i)]);
}