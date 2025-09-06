import { getTrends } from "@/app/lib/services";
import Link from "next/link";
import DeleteButton from "@/app/components/DeleteButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDateToYYYYMMDD } from "@/app/lib/utils";
import ContentWithLinks from "@/app/components/ContentWithLinks";

export default async function TrendsPage() {
  const trends = await getTrends();
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Trends</h1>
          <p className="text-left">Trendsの目的は、外部の最新情報を、広く<span className="font-bold">「発信」</span>していく事です。</p>
        </div>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/reports/new?type=trend">新しいトレンドを作成</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.map((trend) => (
          <div key={trend.id} className="border p-4 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-2">{trend.title}</h2>
            <Link href={`/users/${trend.author_id}`} className="flex items-center space-x-2 text-sm text-gray-600 mb-2 hover:underline">
              <Avatar className="h-6 w-6">
                <AvatarImage src={trend.authorImage || ''} alt={trend.authorname || 'Avatar'} />
                <AvatarFallback>{trend.authorname?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <span>{trend.authorname || 'Unknown'}</span>
            </Link>
            <Link href={`/trends/${trend.id}`} className="text-gray-700 mb-4 line-clamp-3 flex-grow hover:text-blue-600 transition-colors">
              <ContentWithLinks content={trend.content} />
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
        ))}
      </div>
    </div>
  );
}