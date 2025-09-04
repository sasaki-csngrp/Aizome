import { getReportById } from "@/app/lib/services";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import Link from "next/link";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    notFound();
  }

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    // JST (GMT+9) に変換し、指定のフォーマットで表示
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tokyo'
    }).replace(',', ''); // "YYYY/MM/DD, HH:mm:ss" のカンマを削除
  };

  return (
    <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-4/5 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {report.title}
          </h1>
          <div className="mt-3 text-sm text-gray-500 flex space-x-4">
            <p>投稿者: {report.authorname || 'Unknown'}</p>
            <p>投稿日: {formatDate(report.created_at)}</p>
            <p>更新日: {formatDate(report.updated_at)}</p>
          </div>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <MarkdownRenderer content={report.content} />
          </div>
        </div>
        <div className="mt-8">
            <Link href="/reports" className="text-indigo-600 hover:text-indigo-900">
                &larr; 一覧に戻る
            </Link>
        </div>
      </div>
    </main>
  );
}