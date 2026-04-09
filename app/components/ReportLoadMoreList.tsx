'use client';

import { Report } from '@/app/lib/models';
import LoadMoreList from '@/app/components/LoadMoreList';
import ReportCard from '@/app/components/ReportCard';

const PAGE_SIZE = 9;

interface ReportLoadMoreListProps {
  initialItems: Report[];
  total: number;
  currentUserId?: string;
}

export default function ReportLoadMoreList({ initialItems, total, currentUserId }: ReportLoadMoreListProps) {
  const fetchMore = async (offset: number) => {
    const res = await fetch(`/api/reports?limit=${PAGE_SIZE}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  };

  return (
    <LoadMoreList
      initialItems={initialItems}
      total={total}
      fetchMore={fetchMore}
      renderItem={(report) => (
        <ReportCard key={report.id} report={report} currentUserId={currentUserId} />
      )}
      pageSize={PAGE_SIZE}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      emptyMessage="まだレポートが投稿されていません。"
    />
  );
}
