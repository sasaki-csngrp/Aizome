'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // `signIn`を呼び出すと、Auth.jsが自動的に
    // `/login/verify-request` ページにリダイレクトします。
    // エラーが発生した場合は、ページにエラークエリパラメータ付きでリダイレクトされます。
    // (例: /login?error=Configuration)
    // 成功した場合、コールバックURL（デフォルトは現在のページ）にリダイレクトされます。
    await signIn('email', { email, callbackUrl: '/' })

    // `signIn`がリダイレクトを試みるため、通常この行には到達しませんが、
    // エラーでリダイレクトしないケースのために残しておきます。
    setIsSubmitting(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Aizome ログイン</h1>
      <p>メールアドレスを入力してください。マジックリンクを送信します。</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder='user@example.com'
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
          {isSubmitting ? '送信中...' : 'マジックリンクを送信'}
        </button>
      </form>
    </div>
  )
}
