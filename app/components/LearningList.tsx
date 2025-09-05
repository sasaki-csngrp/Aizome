'use client'

import { LearningContent } from '@/app/lib/models';
import LearningCard from './LearningCard';

interface LearningListProps {
  learningContents: LearningContent[];
}

export default function LearningList({ learningContents }: LearningListProps) {
  if (learningContents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">まだ学習教材が登録されていません。</p>
        <p className="text-gray-400 mt-2">新規作成ボタンから学習教材を作成してください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {learningContents.map((learningContent) => (
        <LearningCard key={learningContent.id} learningContent={learningContent} />
      ))}
    </div>
  );
}
