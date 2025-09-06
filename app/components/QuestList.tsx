'use client';

import { Quest } from '@/app/lib/models';
import QuestCard from './QuestCard';

interface QuestListProps {
  quests: Quest[];
}

export default function QuestList({ quests }: QuestListProps) {
  const groupQuestsByCategory = (quests: Quest[]) => {
    const grouped = quests.reduce((acc, quest) => {
      if (!acc[quest.category]) {
        acc[quest.category] = [];
      }
      acc[quest.category].push(quest);
      return acc;
    }, {} as Record<string, Quest[]>);

    // カテゴリの順序を定義
    const categoryOrder = ['tutorial', 'daily', 'weekly', 'learning'];
    return categoryOrder.map(category => ({
      category,
      quests: grouped[category] || []
    })).filter(group => group.quests.length > 0);
  };

  const getCategoryTitle = (category: string) => {
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

  const groupedQuests = groupQuestsByCategory(quests);

  return (
    <div className="space-y-8">
      {groupedQuests.map(({ category, quests: categoryQuests }) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2">
            {getCategoryTitle(category)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      ))}
      
      {quests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">クエストがありません</p>
        </div>
      )}
    </div>
  );
}
