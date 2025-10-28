'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import MarkdownRendererClient from '@/app/components/MarkdownRendererClient'
import { Report } from '@/app/lib/models'
import { useRouter } from 'next/navigation'
import QuestClearPopup from './QuestClearPopup'

interface ReportFormProps {
  initialReport?: Report;
  initialType?: 'report' | 'trend'; // Add initialType
}

export default function ReportForm({ initialReport, initialType }: ReportFormProps) {
  const [title, setTitle] = useState(initialReport?.title || '')
  const [content, setContent] = useState(initialReport?.content || '')
  const [type, setType] = useState<'report' | 'trend'>(initialReport?.type || initialType || 'report'); // Add type state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showQuestPopup, setShowQuestPopup] = useState(false)
  const [questPoints, setQuestPoints] = useState(0)
  const router = useRouter();

  useEffect(() => {
    if (initialReport) {
      setTitle(initialReport.title);
      setContent(initialReport.content);
      setType(initialReport.type); // Set type from initialReport
    } else {
      setTitle('');
      setContent('');
      setType(initialType || 'report'); // Reset type for new report
    }
  }, [initialReport, initialType]); // Add initialType to dependency array


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const method = initialReport ? 'PUT' : 'POST';
      const url = initialReport ? `/api/reports/${initialReport.id}` : '/api/reports';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, type }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || (initialReport ? 'レポートの更新に失敗しました。' : 'レポートの作成に失敗しました。'))
      }

      const result = await response.json()
      setSuccess(initialReport ? 'レポートが正常に更新されました！' : 'レポートが正常に作成されました！')
      if (!initialReport) {
        setTitle('')
        setContent('')
        
        // 新規投稿時のクエストクリアチェック
        try {
          const questResponse = await fetch('/api/checkClearQuest', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trigger_event: 'report_posted'
            }),
          });
          
          if (questResponse.ok) {
            const questResult = await questResponse.json();
            if (questResult.points > 0) {
              setQuestPoints(questResult.points);
              setShowQuestPopup(true);
              // ポップアップ表示後にページ遷移を遅延
              setTimeout(() => {
                router.push(type === 'report' ? '/reports' : '/trends');
              }, 3000);
              return;
            }
          }
        } catch (questError) {
          console.error('Quest check error:', questError);
        }
      }
      console.log('Report operation successful:', result)
      router.push(type === 'report' ? '/reports' : '/trends');
    } catch (err: unknown) {
      let errorMessage = '予期せぬエラーが発生しました。';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error submitting report:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-lg flex flex-col md:flex-row gap-8">
      {/* Left Column: Input Form */}
      <form onSubmit={handleSubmit} className="w-full md:w-1/2 min-w-0 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-6 pr-4">
        <h1 className="text-3xl font-bold text-center mb-6">{initialReport ? '投稿の編集' : '新規投稿の作成'}</h1>

        {/* Type Selection */}
        <div className="mb-4">
          <Label>投稿タイプ</Label>
          <div className="flex space-x-4 mt-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="typeReport"
                name="reportType"
                value="report"
                checked={type === 'report'}
                onChange={() => setType('report')}
                className="mr-2"
                disabled={isSubmitting}
              />
              <Label htmlFor="typeReport">レポート</Label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="typeTrend"
                name="reportType"
                value="trend"
                checked={type === 'trend'}
                onChange={() => setType('trend')}
                className="mr-2"
                disabled={isSubmitting}
              />
              <Label htmlFor="typeTrend">トレンド</Label>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        <div>
          <Label htmlFor="reportTitle">タイトル</Label>
          <Input
            id="reportTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="投稿のタイトルを入力してください"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="reportContent">内容</Label>
          <Textarea
            id="reportContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="投稿の内容を入力してください"
            rows={8}
            className="max-h-[350px] overflow-y-auto"
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (initialReport ? '更新中...' : '作成中...') : (initialReport ? '投稿を更新' : '新規投稿を保存')}
        </button>
      </form>

      {/* Right Column: Real-time Preview */}
      <div className="w-full md:w-1/2 min-w-0 bg-gray-50 p-6 rounded-md border border-gray-200 flex flex-col">
        <h2 className="text-2xl font-semibold mb-4">プレビュー</h2>
        <div className="overflow-y-auto overflow-x-auto h-96 md:h-[60vh] pr-4 break-words">
          <h3 className="text-xl font-bold mb-2">{title || 'タイトルがここに入力されます'}</h3>
          <MarkdownRendererClient content={content || '内容がここに表示されます'} />
        </div>
      </div>
      
      <QuestClearPopup
        isOpen={showQuestPopup}
        onClose={() => setShowQuestPopup(false)}
        points={questPoints}
      />
    </div>
  )
}