import crypto from 'crypto'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export interface VerificationToken {
  identifier: string
  token: string
  expires: Date
}

/**
 * 確認トークンを生成し、データベースに保存する
 */
export async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後

  const client = await pool.connect()
  try {
    // 既存のトークンを削除（同じメールアドレスの古いトークン）
    await client.query(
      'DELETE FROM verification_token WHERE identifier = $1',
      [email]
    )

    // 新しいトークンを保存
    await client.query(
      'INSERT INTO verification_token (identifier, token, expires) VALUES ($1, $2, $3)',
      [email, token, expires]
    )

    return token
  } finally {
    client.release()
  }
}

/**
 * 確認トークンを検証し、有効な場合はユーザーのemailVerifiedを更新する
 */
export async function verifyToken(token: string): Promise<{ success: boolean; email?: string; error?: string }> {
  const client = await pool.connect()
  try {
    // トークンを検索
    const { rows } = await client.query(
      'SELECT identifier, expires FROM verification_token WHERE token = $1',
      [token]
    )

    if (rows.length === 0) {
      return { success: false, error: 'Invalid token' }
    }

    const { identifier: email, expires } = rows[0]

    // 有効期限チェック
    if (new Date() > new Date(expires)) {
      // 期限切れトークンを削除
      await client.query('DELETE FROM verification_token WHERE token = $1', [token])
      return { success: false, error: 'Token expired' }
    }

    // ユーザーのemailVerifiedを更新
    await client.query(
      'UPDATE users SET "emailVerified" = $1 WHERE email = $2',
      [new Date(), email]
    )

    // 使用済みトークンを削除
    await client.query('DELETE FROM verification_token WHERE token = $1', [token])

    return { success: true, email }
  } catch (error) {
    console.error('Error verifying token:', error)
    return { success: false, error: 'Internal server error' }
  } finally {
    client.release()
  }
}

/**
 * 指定されたメールアドレスの確認トークンを再生成する
 */
export async function regenerateVerificationToken(email: string): Promise<string> {
  return createVerificationToken(email)
}
