import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      nickname?: string | null
      bio?: string | null
      total_points?: number | null
      role?: 'user' | 'admin'
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    nickname?: string | null
    bio?: string | null
    total_points?: number | null
    role?: 'user' | 'admin'
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    nickname?: string | null
    bio?: string | null
    total_points?: number | null
    avatar_id?: number | null
    role?: 'user' | 'admin'
    picture?: string | null
  }
}