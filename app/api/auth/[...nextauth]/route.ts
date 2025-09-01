import NextAuth, { NextAuthOptions } from "next-auth"
import { Pool } from "pg"
import PostgresAdapter from "@auth/pg-adapter"
import EmailProvider from "next-auth/providers/email"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});




export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM,
      /**
       * 開発環境でマジックリンクをコンソールに出力するためのカスタム関数
       */
      async sendVerificationRequest({ identifier: email, url }) {
        console.log(`
★★★ Magic Link for ${email}:
${url}
`);
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/login/verify-request', // (e.g. check your email)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
