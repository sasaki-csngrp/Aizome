'use client'

import { SessionProvider } from 'next-auth/react'

// SessionProviderをラップしたクライアントコンポーネント
export function AuthProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
