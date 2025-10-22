import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/lib/verification'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const result = await verifyToken(token)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Invalid or expired token' 
      }, { status: 400 })
    }

    // 成功時は確認完了ページにリダイレクト
    return NextResponse.redirect(new URL('/email-verified', req.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
