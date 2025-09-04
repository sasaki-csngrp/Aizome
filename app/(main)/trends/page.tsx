import { getTrends } from "@/app/lib/services";
import Link from "next/link";
import DeleteButton from "@/app/components/DeleteButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";

export default async function TrendsPage() {
  const trends = await getTrends();
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  const renderContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trends</h1>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/reports/new?type=trend">新しいトレンドを作成</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.map((trend) => (
          <div key={trend.id} className="border p-4 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-2">{trend.title}</h2>
            <p className="text-gray-600 text-sm mb-2">投稿者: {trend.authorname || 'Unknown'}</p>
            <p className="text-gray-700 mb-4 line-clamp-3 flex-grow">{renderContentWithLinks(trend.content)}</p>
            <div className="text-sm text-gray-500 mb-2">
              <p>投稿日: {formatDate(trend.createdAt)}</p>
              <p>更新日: {formatDate(trend.updatedAt)}</p>
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