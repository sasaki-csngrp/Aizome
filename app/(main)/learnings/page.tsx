import { getLearningContentsForUser } from '@/app/lib/services';
import LearningList from '@/app/components/LearningList';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export default async function LearningsPage() {
  const session = await getServerSession(authOptions);
  const learningContents = await getLearningContentsForUser();
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="container mx-auto px-2 py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {isAdmin ? '学習コンテンツ管理' : 'AI学習'}
          </h1>
          {isAdmin && (
            <Link 
              href="/learnings/new" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              新規作成
            </Link>
          )}
        </div>
        
        <LearningList learningContents={learningContents} />
      </div>
    </div>
  );
}
