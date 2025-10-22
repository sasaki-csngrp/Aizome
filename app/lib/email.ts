import sgMail from '@sendgrid/mail'

// SendGrid クライアントを初期化
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export interface VerificationEmailData {
  to: string
  token: string
  name?: string
}

export async function sendVerificationEmail({ to, token, name }: VerificationEmailData) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`
  const displayName = name || to.split('@')[0]

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'メールアドレスの確認をお願いします',
    text: `
${displayName} 様

Aizome へのご登録ありがとうございます。

以下のリンクをクリックして、メールアドレスの確認を完了してください：

${verificationUrl}

このリンクは24時間有効です。

もしこのメールに心当たりがない場合は、このメールを無視してください。

---
Aizome チーム
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>メールアドレス確認</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; border: 1px solid #e9ecef;">
    <h1 style="color: #495057; margin-bottom: 20px;">メールアドレスの確認</h1>
    
    <p>${displayName} 様</p>
    
    <p>Aizome へのご登録ありがとうございます。</p>
    
    <p>以下のボタンをクリックして、メールアドレスの確認を完了してください：</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" 
         style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        メールアドレスを確認する
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6c757d;">
      または、以下のリンクをコピーしてブラウザに貼り付けてください：<br>
      <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #6c757d;">
      <strong>注意：</strong>このリンクは24時間有効です。<br>
      もしこのメールに心当たりがない場合は、このメールを無視してください。
    </p>
    
    <p style="font-size: 12px; color: #6c757d; margin-top: 20px;">
      ---<br>
      Aizome チーム
    </p>
  </div>
</body>
</html>
    `.trim(),
  }

  try {
    await sgMail.send(msg)
    console.log(`Verification email sent to ${to}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error }
  }
}
