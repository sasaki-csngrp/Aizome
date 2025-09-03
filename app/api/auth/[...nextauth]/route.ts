import NextAuth, { NextAuthOptions } from "next-auth"
import { Pool } from "pg"
import PostgresAdapter from "@auth/pg-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool),
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
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          );
          const user = rows[0];

          if (user && user.hashedPassword) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.hashedPassword
            );

            if (isPasswordCorrect) {
              // `authorize`関数は、DBのユーザーオブジェクトをそのまま返すべきではありません。
              // セキュリティ上の理由から、必要な情報だけを含むオブジェクトを返します。
              return { id: user.id, email: user.email, name: user.name };
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
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = (token.id || token.sub)!;
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
