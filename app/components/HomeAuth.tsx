'use client'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomeAuth() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="w-24 h-10 rounded-md bg-gray-200 animate-pulse" />
  }

  if (!session) {
    return (
      <Button asChild>
        <Link href="/login">ログイン</Link>
      </Button>
    )
  }

  return (
    <div className="text-center">
      <p className="text-sm mb-2">ようこそ, {session.user?.name || session.user?.email} さん</p>
      <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' }) }>
        ログアウト
      </Button>
    </div>
  )
}
