'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import MarkdownRenderer from '@/app/components/MarkdownRenderer'
import { Report } from '@/app/lib/models'
import { useRouter } from 'next/navigation'

interface ReportFormProps {
  initialReport?: Report;
}

export default function ReportForm({ initialReport }: ReportFormProps) {
  const [title, setTitle] = useState(initialReport?.title || '')
  const [content, setContent] = useState(initialReport?.content || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter();

  useEffect(() => {
    if (initialReport) {
      setTitle(initialReport.title);
      setContent(initialReport.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [initialReport]);


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
        body: JSON.stringify({ title, content }),
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
      }
      console.log('Report operation successful:', result)
      router.push('/reports');
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
    <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg flex flex-col md:flex-row gap-8">
      {/* Left Column: Input Form */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">{initialReport ? 'レポート編集' : '新規レポート作成'}</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        <div>
          <Label htmlFor="reportTitle">タイトル</Label>
          <Input
            id="reportTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="レポートのタイトルを入力してください"
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
            placeholder="レポートの内容を入力してください"
            rows={15}
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (initialReport ? '更新中...' : '作成中...') : (initialReport ? 'レポートを更新' : 'レポートを保存')}
        </button>
      </form>

      {/* Right Column: Real-time Preview */}
      <div className="flex-1 bg-gray-50 p-6 rounded-md border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">プレビュー</h2>
        <div>
          <h3 className="text-xl font-bold mb-2">{title || 'タイトルがここに入力されます'}</h3>
          <MarkdownRenderer content={content || '内容がここに表示されます'} />
        </div>
      </div>
    </div>
  )
}