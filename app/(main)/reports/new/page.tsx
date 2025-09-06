import ReportForm from '@/app/components/ReportForm';
import Link from 'next/link';

export default async function NewReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>; 
}) {
  const resolvedSearchParams = await searchParams;
  const typeParam = resolvedSearchParams?.type as string | undefined;
  const initialType = typeParam || 'report';
  const finalInitialType: 'report' | 'trend' = (initialType === 'report' || initialType === 'trend') ? initialType : 'report';

  return (
    <div className="container mx-auto px-2 py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <ReportForm initialType={finalInitialType} />
        <div className="mt-8">
          <Link href="/reports" className="text-indigo-600 hover:text-indigo-900">
            &larr; 一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}