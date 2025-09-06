import { getLearningContentById } from "@/app/lib/services";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import LearningQaForm from "@/app/components/LearningQaForm";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDateToYYYYMMDD } from "@/app/lib/utils";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export default async function LearningContentDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const learningContent = await getLearningContentById(id);
  const isAdmin = session?.user?.role === 'admin';

  if (!learningContent) {
    notFound();
  }

  return (
    <main className="container mx-auto px-2 py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {learningContent.title}
          </h1>
          <div className="mt-3 text-sm text-gray-500 flex items-center space-x-4">
            <Link href={`/users/${learningContent.author_id}`} className="flex items-center space-x-2 hover:underline">
              <Avatar className="h-8 w-8">
                <AvatarImage src={learningContent.authorImage || ''} alt={learningContent.authorname || 'Avatar'} />
                <AvatarFallback>{learningContent.authorname?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{learningContent.authorname || 'Unknown'}</span>
            </Link>
            <span className="text-gray-300">|</span>
            <p>投稿日: {formatDateToYYYYMMDD(learningContent.created_at)}</p>
            <p>更新日: {formatDateToYYYYMMDD(learningContent.updated_at)}</p>
            <span className="text-gray-300">|</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              難易度: {learningContent.difficulty}
            </span>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">学習内容</h2>
            <MarkdownRenderer content={learningContent.content} />
          </div>
        </div>

        <LearningQaForm 
          question={learningContent.question} 
          answer={learningContent.answer}
          contentId={learningContent.id}
        />

        <div className="mt-8">
          <Link href="/learnings" className="text-indigo-600 hover:text-indigo-900">
            &larr; 一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

