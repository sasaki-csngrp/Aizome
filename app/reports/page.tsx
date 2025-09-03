import { getAllReports } from "@/app/lib/services";
import Link from "next/link";
import DeleteButton from "@/app/components/DeleteButton";
import { getServerSession } from "next-auth"; // 追加
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // 追加

export default async function ReportsPage() {
  const reports = await getAllReports();
  const session = await getServerSession(authOptions); // 追加
  const currentUserId = session?.user?.id; // 追加

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="border p-4 rounded-lg shadow-md flex flex-col">
            <h2 className="text-xl font-semibold mb-2">{report.title}</h2>
            <p className="text-gray-600 text-sm mb-2">投稿者: {report.authorname || 'Unknown'}</p>
            <p className="text-gray-700 mb-4 line-clamp-3 flex-grow">{report.content}</p>
            <div className="text-sm text-gray-500 mb-2">
              <p>投稿日: {formatDate(report.created_at)}</p>
              <p>更新日: {formatDate(report.updated_at)}</p>
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