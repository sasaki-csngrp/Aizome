import ReportForm from '@/app/components/ReportForm';
import { getReportById } from '@/app/lib/services';

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) {
    // Handle case where report is not found, e.g., redirect to 404 or reports list
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-red-500 text-lg">レポートが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <ReportForm initialReport={report} />
    </div>
  );
}