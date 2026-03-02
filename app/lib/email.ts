import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({
  region: process.env.AWS_REGION ?? 'ap-northeast-1',
})

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  const fromEmail = process.env.EMAIL_FROM

  if (!fromEmail) {
    throw new Error('EMAIL_FROM environment variable is not set')
  }

  const textContent = text ?? html.replace(/<[^>]*>/g, '')

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
        Text: {
          Charset: 'UTF-8',
          Data: textContent,
        },
      },
    },
  })

  console.log('Sending email:', { to, from: fromEmail, subject })

  try {
    const result = await sesClient.send(command)
    console.log('SES email sent successfully:', {
      messageId: result.MessageId,
    })
    return { success: true }
  } catch (error: unknown) {
    console.error('SES error occurred:')
    console.error('Error:', error)
    throw error
  }
}

export interface VerificationEmailData {
  to: string
  token: string
  name?: string
}

export async function sendVerificationEmail({ to, token, name }: VerificationEmailData) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`
  const displayName = name || to.split('@')[0]

  const subject = 'メールアドレスの確認をお願いします'
  const text = `
${displayName} 様

Aizome へのご登録ありがとうございます。

以下のリンクをクリックして、メールアドレスの確認を完了してください：

${verificationUrl}

このリンクは24時間有効です。

もしこのメールに心当たりがない場合は、このメールを無視してください。

---
Aizome チーム
  `.trim()
  const html = `
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
  `.trim()

  try {
    await sendEmail({ to, subject, html, text })
    console.log(`Verification email sent to ${to}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error }
  }
}
