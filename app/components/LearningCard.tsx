'use client'

import { LearningContent } from '@/app/lib/models';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface LearningCardProps {
  learningContent: LearningContent;
}

export default function LearningCard({ learningContent }: LearningCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const isAdmin = session?.user?.role === 'admin';

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return '初級';
      case 2: return '中級';
      case 3: return '上級';
      default: return '初級';
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const handleEdit = () => {
    router.push(`/learnings/edit/${learningContent.id}`);
  };

  const handleCopyId = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(learningContent.id).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `「${learningContent.title}」を削除しますか？\nこの操作は取り消せません。`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/learnings/${learningContent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '削除に失敗しました。');
      }

      // 削除成功後、ページをリロード
      window.location.reload();
    } catch (error) {
      console.error('Error deleting learning content:', error);
      alert(error instanceof Error ? error.message : '削除中にエラーが発生しました。');
    } finally {
      setIsDeleting(false);
    }
  };

  const isLearned = learningContent.is_learned;
  const cardBgClass = isLearned ? "bg-gray-100" : "bg-white";
  const cardHoverClass = isLearned ? "" : "hover:shadow-lg";
  
  return (
    <div className={`${cardBgClass} rounded-lg shadow-md border border-gray-200 p-6 ${cardHoverClass} transition-shadow`}>
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-6">
          {/* ID and Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {/* ID表示は管理者のみ */}
              {isAdmin && (
                <button
                  onClick={handleCopyId}
                  className="relative group text-xs text-gray-400 font-mono bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                  title="クリックしてIDをコピー"
                >
                  {learningContent.id.slice(0, 8)}...
                  {isCopied && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      コピーしました！
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => router.push(`/learnings/${learningContent.id}`)}
                className={`text-lg font-semibold truncate hover:text-blue-600 hover:underline text-left ${
                  isLearned ? 'text-gray-600' : 'text-gray-900'
                }`}
              >
                {learningContent.title}
                {isLearned && <span className="ml-2 text-sm text-gray-500">(クリア済み)</span>}
              </button>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center space-x-2 min-w-0">
            {learningContent.authorImage && (
              <img
                src={learningContent.authorImage}
                alt={learningContent.authorname || 'Author'}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-gray-600 truncate">
              {learningContent.authorname || 'Unknown'}
            </span>
          </div>

          {/* Difficulty */}
          <div className="min-w-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(learningContent.difficulty)}`}>
              {getDifficultyLabel(learningContent.difficulty)}
            </span>
          </div>

          {/* Prerequisite Content ID - Admin only */}
          {isAdmin && (
            <div className="min-w-0">
              <span className="text-sm text-gray-500">
                {learningContent.prerequisite_content_id ? `前提ID: ${learningContent.prerequisite_content_id.slice(0, 8)}...` : '前提なし'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - Admin only */}
        {isAdmin && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? '削除中...' : '削除'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {/* ID and Title */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            {/* ID表示は管理者のみ */}
            {isAdmin && (
              <button
                onClick={handleCopyId}
                className="relative group text-xs text-gray-400 font-mono bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                title="クリックしてIDをコピー"
              >
                {learningContent.id.slice(0, 8)}...
                {isCopied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    コピーしました！
                  </span>
                )}
              </button>
            )}
          </div>
          <button
            onClick={() => router.push(`/learnings/${learningContent.id}`)}
            className={`text-lg font-semibold hover:text-blue-600 hover:underline text-left ${
              isLearned ? 'text-gray-600' : 'text-gray-900'
            }`}
          >
            {learningContent.title}
            {isLearned && <span className="ml-2 text-sm text-gray-500">(クリア済み)</span>}
          </button>
        </div>

        {/* Author and Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {learningContent.authorImage && (
              <img
                src={learningContent.authorImage}
                alt={learningContent.authorname || 'Author'}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-gray-600">
              {learningContent.authorname || 'Unknown'}
            </span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(learningContent.difficulty)}`}>
            {getDifficultyLabel(learningContent.difficulty)}
          </span>
        </div>

        {/* Prerequisite Content ID - Admin only */}
        {isAdmin && (
          <div>
            <span className="text-sm text-gray-500">
              {learningContent.prerequisite_content_id ? `前提ID: ${learningContent.prerequisite_content_id.slice(0, 8)}...` : '前提なし'}
            </span>
          </div>
        )}

        {/* Action Buttons - Admin only */}
        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? '削除中...' : '削除'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
