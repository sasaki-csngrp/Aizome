'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface LoadMoreListProps<T> {
  initialItems: T[];
  total: number;
  fetchMore: (offset: number) => Promise<{ items: T[]; hasMore: boolean }>;
  renderItem: (item: T) => React.ReactNode;
  pageSize: number;
  className?: string;
  emptyMessage?: string;
}

export default function LoadMoreList<T extends { id: string }>({
  initialItems,
  total,
  fetchMore,
  renderItem,
  pageSize,
  className,
  emptyMessage = 'データがありません。',
}: LoadMoreListProps<T>) {
  const [items, setItems]     = useState<T[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialItems.length < total);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const result = await fetchMore(items.length);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, items.length, fetchMore]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className={className}>
        {items.map((item) => renderItem(item))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center mt-8 pb-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '読み込み中...' : 'もっと見る'}
          </button>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-gray-400 mt-8 text-sm pb-4">
          全{items.length}件を表示しています
        </p>
      )}
    </div>
  );
}
