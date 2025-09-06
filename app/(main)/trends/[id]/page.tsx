'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDateToYYYYMMDD } from '@/app/lib/utils';
import QuestClearPopup from '@/app/components/QuestClearPopup';
import ContentWithLinks from '@/app/components/ContentWithLinks';

interface Trend {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author_id: string;
  authorname: string;
  authorImage: string;
  likeCount: number;
}

export default function TrendDetailPage() {
  const params = useParams();
  const trendId = params.id as string;
  
  const [trend, setTrend] = useState<Trend | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestPopup, setShowQuestPopup] = useState(false);
  const [questPoints, setQuestPoints] = useState(0);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const response = await fetch(`/api/reports/${trendId}`);
        if (response.ok) {
          const data = await response.json();
          setTrend(data);
          
          // トレンド閲覧時のクエストクリアチェック
          try {
            const questResponse = await fetch('/api/checkClearQuest', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                trigger_event: 'trend_read'
              }),
            });
            
            if (questResponse.ok) {
              const questResult = await questResponse.json();
              if (questResult.points > 0) {
                setQuestPoints(questResult.points);
                setShowQuestPopup(true);
              }
            }
          } catch (questError) {
            console.error('Quest check error:', questError);
          }
        }
      } catch (error) {
        console.error('Error fetching trend:', error);
      } finally {
        setLoading(false);
      }
    };

    if (trendId) {
      fetchTrend();
    }
  }, [trendId]);


  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!trend) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">トレンドが見つかりません</h1>
        <Button asChild>
          <Link href="/trends">トレンド一覧に戻る</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button asChild variant="outline">
            <Link href="/trends">← トレンド一覧に戻る</Link>
          </Button>
        </div>
        
        <article className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">{trend.title}</h1>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Avatar className="h-8 w-8">
              <AvatarImage src={trend.authorImage || ''} alt={trend.authorname || 'Avatar'} />
              <AvatarFallback>{trend.authorname?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <Link href={`/users/${trend.author_id}`} className="hover:underline">
              {trend.authorname || 'Unknown'}
            </Link>
            <span>•</span>
            <span>投稿日: {formatDateToYYYYMMDD(trend.createdAt)}</span>
            <span>•</span>
            <span>更新日: {formatDateToYYYYMMDD(trend.updatedAt)}</span>
          </div>
          
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              <ContentWithLinks content={trend.content} />
            </div>
          </div>
        </article>
      </div>
      
      <QuestClearPopup
        isOpen={showQuestPopup}
        onClose={() => setShowQuestPopup(false)}
        points={questPoints}
      />
    </div>
  );
}
