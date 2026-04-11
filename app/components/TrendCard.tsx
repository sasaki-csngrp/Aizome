'use client';

import Link from 'next/link';
import DeleteButton from '@/app/components/DeleteButton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDateToYYYYMMDD, stripMarkdown } from '@/app/lib/utils';
import { Report } from '@/app/lib/models';

interface TrendCardProps {
  trend: Report;
  currentUserId?: string;
}

export default function TrendCard({ trend, currentUserId }: TrendCardProps) {
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
      <Link href={`/trends/${trend.id}`} className="text-gray-700 mb-4 line-clamp-3 flex-grow hover:text-blue-600 transition-colors">
        {stripMarkdown(trend.content)}
      </Link>
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
