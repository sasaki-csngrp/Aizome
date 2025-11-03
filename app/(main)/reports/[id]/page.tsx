import { getReportById } from "@/app/lib/services";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import LikeButton from "@/app/components/LikeButton";
import { isReportLikedByCurrentUser } from "@/app/lib/services";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDateToYYYYMMDD } from "@/app/lib/utils";

// キャッシュを無効化して常に最新のデータを取得
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportById(id);
  const liked = await isReportLikedByCurrentUser(id);

  if (!report) {
    notFound();
  }

  return (
    <main className="container mx-auto px-2 py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {report.title}
          </h1>
          <div className="mt-3 text-sm text-gray-500 flex items-center space-x-4">
            <Link href={`/users/${report.author_id}`} className="flex items-center space-x-2 hover:underline">
              <Avatar className="h-8 w-8">
                <AvatarImage src={report.authorImage || ''} alt={report.authorname || 'Avatar'} />
                <AvatarFallback>{report.authorname?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{report.authorname || 'Unknown'}</span>
            </Link>
            <span className="text-gray-300">|</span>
            <p>投稿日: {formatDateToYYYYMMDD(report.createdAt)}</p>
            <p>更新日: {formatDateToYYYYMMDD(report.updatedAt)}</p>
          </div>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <MarkdownRenderer content={report.content} />
          </div>
        </div>
        <div className="mt-6">
          <LikeButton reportId={report.id} initialLiked={liked} initialLikeCount={report.likeCount ?? 0} />
        </div>
        <div className="mt-8">
            <Link href="/reports" className="text-indigo-600 hover:text-indigo-900">
                &larr; 一覧に戻る
            </Link>
        </div>
      </div>
    </main>
  );
}