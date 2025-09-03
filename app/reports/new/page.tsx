import ReportForm from '@/app/components/ReportForm';
import Link from 'next/link';

export default function NewReportPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-4/5 mx-auto">
        <ReportForm />
        <div className="mt-8">
          <Link href="/reports" className="text-indigo-600 hover:text-indigo-900">
            &larr; 一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}