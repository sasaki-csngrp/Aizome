import { getAllReports } from "@/app/lib/services";
import Link from "next/link";
import DeleteButton from "@/app/components/DeleteButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";

export default async function ReportsPage() {
  const reports = await getAllReports();
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-left">Reportsの目的は、ユーザー自身の経験や学びを<span className="font-bold">「蓄積」</span>していき、広く <span className="font-bold">「共有」</span> する事です。</p>
        </div>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/reports/new?type=report">新しいレポートを作成</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="border p-4 rounded-lg shadow-md flex flex-col">
            <Link href={`/reports/${report.id}`} className="hover:underline">
              <h2 className="text-xl font-semibold mb-2">{report.title}</h2>
            </Link>
            <p className="text-gray-600 text-sm mb-2">投稿者: {report.authorname || 'Unknown'}</p>
            <p className="text-gray-700 mb-4 line-clamp-3 flex-grow">{report.content}</p>
            <div className="text-sm text-gray-500 mb-2">
              <p>投稿日: {formatDate(report.createdAt)}</p>
              <p>更新日: {formatDate(report.updatedAt)}</p>
            </div>
            <div className="flex justify-between items-center mt-auto">
              <Link href={`/reports/${report.id}`} className="text-blue-500 hover:underline">
                詳細表示
              </Link>
              {report.author_id === currentUserId && ( // 条件分岐を追加
                <div className="space-x-2">
                  <Link href={`/reports/${report.id}/edit`} className="text-green-600 hover:underline">
                    編集
                  </Link>
                  <DeleteButton reportId={report.id} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}