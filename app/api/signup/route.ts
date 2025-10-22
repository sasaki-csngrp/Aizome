import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // ドメインチェックを追加
    const domain = email.split('@')[1];
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',').map(d => d.trim()) || [];

    if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
      return NextResponse.json({ 
        error: '申し訳ございません。本サービスは承認されたドメインユーザーのみ利用可能です。\nご利用を希望される場合は、最寄りの弊社担当者へお伝え下さい。' 
      }, { status: 403 });
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      // 既存ユーザーのチェック
      const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }

      // 新規ユーザーの登録
      // name は email の @ より前の部分を仮で設定します。
      const name = email.split('@')[0];
      const newUser = await client.query(
        'INSERT INTO users (name, email, "hashedPassword", "emailVerified") VALUES ($1, $2, $3, $4) RETURNING id, name, email',
        [name, email, hashedPassword, new Date()] // emailVerified は仮で現在時刻を設定
      );

      return NextResponse.json(newUser.rows[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
