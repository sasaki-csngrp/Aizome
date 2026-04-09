'use client';

import { Report } from '@/app/lib/models';
import LoadMoreList from '@/app/components/LoadMoreList';
import TrendCard from '@/app/components/TrendCard';

const PAGE_SIZE = 9;

interface TrendLoadMoreListProps {
  initialItems: Report[];
  total: number;
  currentUserId?: string;
}

export default function TrendLoadMoreList({ initialItems, total, currentUserId }: TrendLoadMoreListProps) {
  const fetchMore = async (offset: number) => {
    const res = await fetch(`/api/trends?limit=${PAGE_SIZE}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch trends');
    return res.json();
  };

  return (
    <LoadMoreList
      initialItems={initialItems}
      total={total}
      fetchMore={fetchMore}
      renderItem={(trend) => (
        <TrendCard key={trend.id} trend={trend} currentUserId={currentUserId} />
      )}
      pageSize={PAGE_SIZE}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      emptyMessage="まだトレンドが投稿されていません。"
    />
  );
}
