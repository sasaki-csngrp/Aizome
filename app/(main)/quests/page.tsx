import { getQuestsWithUserStatus } from '@/app/lib/services';
import QuestList from '@/app/components/QuestList';

export default async function QuestsPage() {
  const quests = await getQuestsWithUserStatus();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">クエスト</h1>
        <p className="text-gray-600">AIスキルを身につけて、ポイントを獲得しよう！</p>
      </div>
      
      <QuestList quests={quests} />
    </div>
  );
}
