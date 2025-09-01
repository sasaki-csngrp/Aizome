import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Link from "next/link"

// サーバーコンポーネントでセッション情報を表示するコンポーネント
async function UserSession() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="text-center">
        <p className="mb-4">現在ログインしていません。</p>
        <Link href="/login" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          ログイン
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="mb-2">ようこそ, {session.user?.email} さん</p>
      <p className="text-sm text-gray-500 mb-6">あなたはログインしています。</p>
      <Link href="/api/auth/signout" className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        ログアウト
      </Link>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-xs overflow-x-auto">
        <h3 className="font-bold mb-2">セッション情報 (デバッグ用)</h3>
        <pre><code>{JSON.stringify(session, null, 2)}</code></pre>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="font-sans flex items-center justify-center min-h-screen">
      <main className="w-full max-w-md mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Aizome</h1>
        <UserSession />
      </main>
    </div>
  )
}