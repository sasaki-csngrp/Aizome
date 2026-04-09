'use client';

import { LearningContent } from '@/app/lib/models';
import LoadMoreList from '@/app/components/LoadMoreList';
import LearningCard from '@/app/components/LearningCard';

const PAGE_SIZE = 10;

interface LearningLoadMoreListProps {
  initialItems: LearningContent[];
  total: number;
}

export default function LearningLoadMoreList({ initialItems, total }: LearningLoadMoreListProps) {
  const fetchMore = async (offset: number) => {
    const res = await fetch(`/api/learnings?limit=${PAGE_SIZE}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch learning contents');
    return res.json();
  };

  return (
    <LoadMoreList
      initialItems={initialItems}
      total={total}
      fetchMore={fetchMore}
      renderItem={(learningContent) => (
        <LearningCard key={learningContent.id} learningContent={learningContent} />
      )}
      pageSize={PAGE_SIZE}
      className="space-y-4"
      emptyMessage="まだ学習教材が登録されていません。"
    />
  );
}
