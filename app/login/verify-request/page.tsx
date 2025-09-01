
export default function VerifyRequestPage() {
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h1>メールをご確認ください</h1>
      <p>ご入力いただいたメールアドレス宛に、ログイン用のマジックリンクを送信しました。</p>
      <p>メールボックスを確認し、リンクをクリックしてログインを完了してください。</p>
      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '20px' }}>
        <strong>開発者向け注:</strong> 開発環境では、メールは実際には送信されず、サーバーを実行しているターミナルのコンソールに表示されます。コンソール内のリンクにアクセスしてください。
      </p>
    </div>
  )
}
