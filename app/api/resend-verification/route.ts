import { NextRequest, NextResponse } from 'next/server'
import { regenerateVerificationToken } from '@/app/lib/verification'
import { sendVerificationEmail } from '@/app/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // 新しい確認トークンを生成
    const token = await regenerateVerificationToken(email)

    // 確認メールを再送信
    const emailResult = await sendVerificationEmail({
      to: email,
      token,
      name: email.split('@')[0]
    })

    if (!emailResult.success) {
      console.error('Failed to resend verification email:', emailResult.error)
      return NextResponse.json({ 
        error: 'Failed to send verification email' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Verification email resent successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
