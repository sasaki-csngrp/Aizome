import { NextAuthOptions } from "next-auth"
import { Pool } from "pg"
import PostgresAdapter from "@auth/pg-adapter"
import { Adapter } from "next-auth/adapters"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { User as CustomUser } from "./models"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool) as Adapter,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const client = await pool.connect();
        try {
          const { rows } = await client.query(
            'SELECT u.*, a.image_url FROM users u LEFT JOIN avatars a ON u.avatar_id = a.id WHERE u.email = $1',
            [credentials.email]
          );
          const user = rows[0];

          if (user && user.hashedPassword) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.hashedPassword
            );

            if (isPasswordCorrect) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                nickname: user.nickname,
                bio: user.bio,
                total_points: user.total_points,
                avatar_id: user.avatar_id,
                role: user.role,
                image: user.image_url,
              } as CustomUser;
            }
          }
          return null;
        } finally {
          client.release();
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.nickname = customUser.nickname;
        token.bio = customUser.bio;
        token.total_points = customUser.total_points;
        token.avatar_id = customUser.avatar_id;
        token.role = customUser.role;
        token.picture = customUser.image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.nickname = token.nickname;
      session.user.bio = token.bio;
      session.user.total_points = token.total_points;
      session.user.role = token.role;
      session.user.image = token.picture;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
}
