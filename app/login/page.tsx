'use client'

import { signIn } from 'next-auth/react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ErrorMessage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (error) {
    const errorMessage = error === 'CredentialsSignin'
      ? 'メールアドレスまたはパスワードが正しくありません。'
      : 'ログイン中にエラーが発生しました。'

    return <p className="text-red-500 mb-4">{errorMessage}</p>
  }

  return null
}

function SuccessMessage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  if (message === 'signup_success') {
    return (
      <p className="text-green-500 mb-4">
        ユーザー登録が完了しました。ログインしてください。
      </p>
    )
  }

  return null
}

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/',
    })

    setIsSubmitting(false)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border border-gray-200 rounded-lg shadow-lg bg-white">
      <h1 className="text-3xl font-bold text-center mb-6">Aizome ログイン</h1>
      <p className="text-center text-gray-600 mb-6">メールアドレスとパスワードを入力してください。</p>

      <Suspense fallback={null}>
        <ErrorMessage />
        <SuccessMessage />
      </Suspense>

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
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSubmitting ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">アカウントをお持ちでないですか？{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPageContent />
      </Suspense>
    </div>
  )
}
