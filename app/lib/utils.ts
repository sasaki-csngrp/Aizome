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