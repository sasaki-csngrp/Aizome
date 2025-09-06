import LearningForm from '@/app/components/LearningForm';
import Link from 'next/link';

export default async function NewLearningPage() {
  return (
    <div className="container mx-auto px-2 py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <LearningForm />
        <div className="mt-8">
          <Link href="/learnings" className="text-indigo-600 hover:text-indigo-900">
            &larr; 一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
