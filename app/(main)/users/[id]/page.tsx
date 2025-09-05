import { getUserById, getReportsByUserId, getAvatars } from "@/app/lib/services";
import { notFound } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const userPromise = getUserById(id);
  const reportsPromise = getReportsByUserId(id);
  const avatarsPromise = getAvatars();

  const [user, userReports, allAvatars] = await Promise.all([
    userPromise,
    reportsPromise,
    avatarsPromise,
  ]);

  if (!user) {
    notFound();
  }

  const userAvatarUrl = allAvatars.find(a => a.id === user.avatar_id)?.image_url || user.image;

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 bg-white p-6 rounded-lg shadow-md mb-8">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-gray-200">
          <AvatarImage src={userAvatarUrl || ''} alt={user.nickname || user.name || 'User Avatar'} />
          <AvatarFallback className="text-4xl">
            {user.nickname?.charAt(0) || user.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left flex-grow">
          <h1 className="text-3xl font-bold text-gray-900">{user.nickname || user.name}</h1>
          <p className="mt-2 text-md text-gray-600 max-w-xl">{user.bio || '自己紹介がありません'}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">投稿したレポート</h2>
        {userReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userReports.map((report) => (
              <div key={report.id} className="border p-4 rounded-lg shadow-md flex flex-col bg-white">
                <Link href={`/reports/${report.id}`} className="hover:underline">
                  <h3 className="text-xl font-semibold mb-2">{report.title}</h3>
                </Link>
                <p className="text-gray-700 mb-4 line-clamp-3 flex-grow">{report.content}</p>
                <div className="text-sm text-gray-500 mt-auto pt-2 border-t border-gray-200">
                  <p>投稿日: {formatDate(report.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">このユーザーはまだレポートを投稿していません。</p>
          </div>
        )}
      </div>
    </div>
  );
}