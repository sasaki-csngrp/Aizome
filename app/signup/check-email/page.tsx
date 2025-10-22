'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function CheckEmailContent() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const handleResend = async () => {
    if (!email) {
      setResendMessage('メールアドレスが見つかりません。')
      return
    }

    setIsResending(true)
    setResendMessage('')

    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setResendMessage('確認メールを再送信しました。')
      } else {
        const data = await res.json()
        setResendMessage(data.error || '再送信に失敗しました。')
      }
    } catch (error) {
      console.error('Resend error:', error)
      setResendMessage('再送信中にエラーが発生しました。')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 border border-gray-200 rounded-lg shadow-lg bg-white">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">確認メールを送信しました</h1>
          
          <p className="text-gray-600 mb-6">
            {email && (
              <>
                <strong>{email}</strong> に確認メールを送信しました。<br />
                メールボックスをご確認ください。
              </>
            )}
            {!email && (
              <>登録されたメールアドレスに確認メールを送信しました。<br />
              メールボックスをご確認ください。</>
            )}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>確認メールが見つからない場合：</strong><br />
              • 迷惑メールフォルダをご確認ください<br />
              • メールアドレスが正しいかご確認ください<br />
              • 数分待ってから再度お試しください
            </p>
          </div>

          {email && (
            <div className="mb-6">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isResending ? '再送信中...' : '確認メールを再送信'}
              </button>
              
              {resendMessage && (
                <p className={`mt-2 text-sm ${resendMessage.includes('再送信しました') ? 'text-green-600' : 'text-red-600'}`}>
                  {resendMessage}
                </p>
              )}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              メール確認が完了したら{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                ログインページ
              </Link>
              からログインしてください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full p-8 border border-gray-200 rounded-lg shadow-lg bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  )
}
