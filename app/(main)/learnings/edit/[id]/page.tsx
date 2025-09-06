import { getLearningContentById } from '@/app/lib/services';
import LearningForm from '@/app/components/LearningForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditLearningPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLearningPage({ params }: EditLearningPageProps) {
  const { id } = await params;
  const learningContent = await getLearningContentById(id);

  if (!learningContent) {
    notFound();
  }

  return (
    <div className="container mx-auto px-2 py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <LearningForm initialLearningContent={learningContent} />
        <div className="mt-8">
          <Link href="/learnings" className="text-indigo-600 hover:text-indigo-900">
            &larr; 一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
