'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DeleteButton from '@/app/components/DeleteButton';
import ContentWithLinks from '@/app/components/ContentWithLinks';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDateToYYYYMMDD, stripMarkdown } from '@/app/lib/utils';
import { Report } from '@/app/lib/models';

interface TrendCardProps {
  trend: Report;
  currentUserId?: string;
}

export default function TrendCard({ trend, currentUserId }: TrendCardProps) {
  const router = useRouter();

  return (
    <div className="border p-4 rounded-lg shadow-md flex flex-col">
      <h2 className="text-xl font-semibold mb-2">{trend.title}</h2>
      <Link href={`/users/${trend.author_id}`} className="flex items-center space-x-2 text-sm text-gray-600 mb-2 hover:underline">
        <Avatar className="h-6 w-6">
          <AvatarImage src={trend.authorImage || ''} alt={trend.authorname || 'Avatar'} />
          <AvatarFallback>{trend.authorname?.charAt(0) || 'A'}</AvatarFallback>
        </Avatar>
        <span>{trend.authorname || 'Unknown'}</span>
      </Link>
      <div
        className="text-gray-700 mb-4 line-clamp-3 flex-grow hover:text-blue-600 transition-colors cursor-pointer"
        onClick={() => router.push(`/trends/${trend.id}`)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(`/trends/${trend.id}`);
          }
        }}
      >
        <ContentWithLinks content={stripMarkdown(trend.content)} />
      </div>
      <div className="text-sm text-gray-500 mb-2">
        <p>投稿日: {formatDateToYYYYMMDD(trend.createdAt)}</p>
        <p>更新日: {formatDateToYYYYMMDD(trend.updatedAt)}</p>
      </div>
      <div className="flex justify-end items-center mt-auto">
        {trend.author_id === currentUserId && (
          <div className="space-x-2">
            <Link href={`/reports/${trend.id}/edit`} className="text-green-600 hover:underline">
              編集
            </Link>
            <DeleteButton reportId={trend.id} />
          </div>
        )}
      </div>
    </div>
  );
}
