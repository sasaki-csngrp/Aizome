'use client';

import { Quest } from '@/app/lib/models';
import { CheckCircle, Star } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
}

export default function QuestCard({ quest }: QuestCardProps) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'tutorial':
        return 'チュートリアル';
      case 'daily':
        return 'ディリークエスト';
      case 'weekly':
        return 'ウィークリークエスト';
      case 'learning':
        return '学習クエスト';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tutorial':
        return 'bg-blue-100 text-blue-800';
      case 'daily':
        return 'bg-green-100 text-green-800';
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      case 'learning':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-md ${
      quest.is_cleared 
        ? 'border-green-300 bg-green-50' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(quest.category)}`}>
              {getCategoryLabel(quest.category)}
            </span>
            {quest.is_cleared && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">クリア済み</span>
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {quest.title}
          </h3>
          {quest.description && (
            <p className="text-gray-600 text-sm mb-3">
              {quest.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 text-yellow-600 ml-4">
          <Star className="w-5 h-5" />
          <span className="font-semibold">{quest.points}</span>
        </div>
      </div>
      
      {quest.is_cleared && quest.cleared_at && (
        <div className="text-sm text-gray-500 border-t pt-3">
          <span className="font-medium">クリア日時: </span>
          {formatDate(quest.cleared_at)}
        </div>
      )}
    </div>
  );
}
