'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push('/login?message=signup_success')
      } else {
        const data = await res.json()
        setError(data.error || '登録中にエラーが発生しました。')
      }
    } catch (err: unknown) { // any から unknown に変更
      console.error('Signup client error:', err); // エラーをコンソールに出力
      if (err instanceof Error) { // 型ガードを追加
        setError(err.message || '登録中に予期せぬエラーが発生しました。');
      } else {
        setError('登録中に予期せぬエラーが発生しました。');
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 border border-gray-200 rounded-lg shadow-lg bg-white">
        <h1 className="text-3xl font-bold text-center mb-6">新規登録</h1>
        <p className="text-center text-gray-600 mb-6">メールアドレスとパスワードを登録してください。</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder='user@example.com'
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認）</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting ? '登録中...' : '登録'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">すでにアカウントをお持ちですか？{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

