'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import MarkdownRenderer from '@/app/components/MarkdownRenderer'
import { LearningContent } from '@/app/lib/models'
import { useRouter } from 'next/navigation'

interface LearningFormProps {
  initialLearningContent?: LearningContent;
}

export default function LearningForm({ initialLearningContent }: LearningFormProps) {
  const [title, setTitle] = useState(initialLearningContent?.title || '')
  const [content, setContent] = useState(initialLearningContent?.content || '')
  const [question, setQuestion] = useState(initialLearningContent?.question || '')
  const [answer, setAnswer] = useState(initialLearningContent?.answer || '')
  const [difficulty, setDifficulty] = useState<number>(initialLearningContent?.difficulty || 1)
  const [prerequisiteContentId, setPrerequisiteContentId] = useState(initialLearningContent?.prerequisite_content_id || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const router = useRouter();

  useEffect(() => {
    if (initialLearningContent) {
      setTitle(initialLearningContent.title);
      setContent(initialLearningContent.content);
      setQuestion(initialLearningContent.question);
      setAnswer(initialLearningContent.answer);
      setDifficulty(initialLearningContent.difficulty);
      setPrerequisiteContentId(initialLearningContent.prerequisite_content_id || '');
    } else {
      setTitle('');
      setContent('');
      setQuestion('');
      setAnswer('');
      setDifficulty(1);
      setPrerequisiteContentId('');
    }
  }, [initialLearningContent]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const method = initialLearningContent ? 'PUT' : 'POST';
      const url = initialLearningContent ? `/api/learning-contents/${initialLearningContent.id}` : '/api/learning-contents';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          content, 
          question, 
          answer, 
          difficulty, 
          prerequisite_content_id: prerequisiteContentId || null 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || (initialLearningContent ? '学習教材の更新に失敗しました。' : '学習教材の作成に失敗しました。'))
      }

      const result = await response.json()
      setSuccess(initialLearningContent ? '学習教材が正常に更新されました！' : '学習教材が正常に作成されました！')
      if (!initialLearningContent) {
        setTitle('')
        setContent('')
        setQuestion('')
        setAnswer('')
        setDifficulty(1)
        setPrerequisiteContentId('')
      }
      console.log('Learning content operation successful:', result)
      router.push('/learning-contents');
    } catch (err: unknown) {
      let errorMessage = '予期せぬエラーが発生しました。';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error submitting learning content:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return '初級';
      case 2: return '中級';
      case 3: return '上級';
      default: return '初級';
    }
  }

  const handleCopyId = () => {
    if (typeof window !== "undefined" && initialLearningContent) {
      navigator.clipboard.writeText(initialLearningContent.id).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }

  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-lg flex flex-col md:flex-row gap-8">
      {/* Left Column: Input Form */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-6">
        {initialLearningContent && (
          <div className="text-center mb-4">
            <button
              onClick={handleCopyId}
              className="relative group text-sm text-gray-500 font-mono bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
              title="クリックしてIDをコピー"
            >
              ID: {initialLearningContent.id}
              {isCopied && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  コピーしました！
                </span>
              )}
            </button>
          </div>
        )}
        <h1 className="text-3xl font-bold text-center mb-6">{initialLearningContent ? '学習教材の編集' : '新規学習教材の作成'}</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        <div>
          <Label htmlFor="learningTitle">タイトル</Label>
          <Input
            id="learningTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="学習教材のタイトルを入力してください"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="learningContent">内容</Label>
          <Textarea
            id="learningContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="学習内容を入力してください（マークダウン対応）"
            rows={8}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="learningQuestion">問題</Label>
          <Textarea
            id="learningQuestion"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="学習問題を入力してください"
            rows={4}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="learningAnswer">回答</Label>
          <Textarea
            id="learningAnswer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="問題の回答を入力してください"
            rows={4}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <Label>難易度</Label>
          <div className="flex space-x-4 mt-2">
            {[1, 2, 3].map((level) => (
              <div key={level} className="flex items-center">
                <input
                  type="radio"
                  id={`difficulty${level}`}
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={() => setDifficulty(level)}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <Label htmlFor={`difficulty${level}`}>{getDifficultyLabel(level)}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="prerequisiteContentId">前提学習ID（任意）</Label>
          <Input
            id="prerequisiteContentId"
            type="text"
            value={prerequisiteContentId}
            onChange={(e) => setPrerequisiteContentId(e.target.value)}
            placeholder="前提となる学習教材のIDを入力してください"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (initialLearningContent ? '更新中...' : '作成中...') : (initialLearningContent ? '学習教材を更新' : '新規学習教材を保存')}
        </button>
      </form>

      {/* Right Column: Real-time Preview */}
      <div className="flex-1 bg-gray-50 p-6 rounded-md border border-gray-200 flex flex-col">
        <h2 className="text-2xl font-semibold mb-4">プレビュー</h2>
        <div className="overflow-y-auto h-198 pr-4 space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{title || 'タイトルがここに入力されます'}</h3>
            <div className="text-sm text-gray-600 mb-2">
              難易度: {getDifficultyLabel(difficulty)}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">学習内容</h4>
            <MarkdownRenderer content={content || '内容がここに表示されます'} />
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">問題</h4>
            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <MarkdownRenderer content={question || '問題がここに表示されます'} />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">回答</h4>
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
              <MarkdownRenderer content={answer || '回答がここに表示されます'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
