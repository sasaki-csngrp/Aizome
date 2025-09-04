import ReportForm from '@/app/components/ReportForm';
import { getReportById } from '@/app/lib/services';
import Link from 'next/link';

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-red-500 text-lg">レポートが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <ReportForm initialReport={report} />
        <div className="mt-8">
          <Link href="/reports" className="text-indigo-600 hover:text-indigo-900">
            &larr; 一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
