# Aizome 外部向け API ドキュメント

## 概要

外部システムからトレンド投稿を登録するための API です。  
認証には事前に発行した API キーを使用します。

---

## 認証方式

すべての外部 API リクエストに `X-API-Key` ヘッダーが必要です。

```
X-API-Key: aizome_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- API キーは管理者が発行します（発行手順は[管理者 API](#管理者-api-apiキー管理) を参照）
- キーは発行時に **1 回だけ** 表示されます。必ず安全な場所に保存してください
- キーが漏洩した場合は管理者に無効化を依頼してください

---

## 外部 API

### POST `/api/v1/trends` — トレンド投稿

#### リクエスト

| 項目 | 値 |
|------|----|
| メソッド | `POST` |
| パス | `/api/v1/trends` |
| 認証 | `X-API-Key` ヘッダー（必須） |
| Content-Type | `application/json; charset=utf-8` |

**ボディ**

```json
{
  "title": "投稿タイトル",
  "content": "投稿内容"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `title` | string | ✓ | トレンドのタイトル |
| `content` | string | ✓ | トレンドの本文 |

#### レスポンス

**成功 (201 Created)**

```json
{
  "id": "27909701-e6ee-443d-877c-d498cdd0288e",
  "title": "投稿タイトル",
  "content": "投稿内容",
  "createdAt": "2026-04-11T07:06:21.598Z"
}
```

**エラー**

| ステータス | 原因 |
|-----------|------|
| `400 Bad Request` | `title` または `content` が未指定・空文字 |
| `401 Unauthorized` | `X-API-Key` ヘッダーが未指定、または無効・無効化済みのキー |
| `500 Internal Server Error` | サーバー内部エラー |

---

## 管理者 API（APIキー管理）

管理者ロール（`role = 'admin'`）のアカウントでログインした状態のみ使用できます。

### POST `/api/admin/api-keys` — APIキー発行

#### リクエスト

| 項目 | 値 |
|------|----|
| メソッド | `POST` |
| パス | `/api/admin/api-keys` |
| 認証 | NextAuth セッション（管理者） |
| Content-Type | `application/json` |

**ボディ**

```json
{ "name": "連携システム名" }
```

**成功 (201 Created)**

```json
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "連携システム名",
  "key": "aizome_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "created_by": "管理者のユーザーID",
  "created_at": "2026-04-11T00:00:00.000Z",
  "is_active": true,
  "note": "Store this key securely. It will not be shown again."
}
```

> `key` フィールドはこのレスポンスでのみ取得できます。DB には保存されません。

---

### GET `/api/admin/api-keys` — APIキー一覧

有効・無効を含む全キーの一覧を返します。生キーは表示されません。

**成功 (200 OK)**

```json
{
  "items": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "連携システム名",
      "created_by": "管理者のユーザーID",
      "created_at": "2026-04-11T00:00:00.000Z",
      "last_used_at": "2026-04-11T07:06:21.598Z",
      "is_active": true
    }
  ]
}
```

---

### DELETE `/api/admin/api-keys/{id}` — APIキー無効化

指定したキーを無効化します。無効化されたキーは認証に使えなくなります。

**成功 (200 OK)**

```json
{ "message": "API key deactivated successfully." }
```

---

## Windows PowerShell での確認手順

### 事前準備

```powershell
$BASE_URL = "http://localhost:3000"  # 本番環境では https:// の URL に変更
```

---

### Step 1: 管理者ログイン（セッション取得）

```powershell
# 1-1. CSRF トークンを取得（-SessionVariable でクッキー容器を初期化）
$csrf = Invoke-RestMethod -Method GET -Uri "$BASE_URL/api/auth/csrf" `
  -SessionVariable session
$csrfToken = $csrf.csrfToken

# 1-2. ログイン（form-urlencoded で送信）
$loginBody = "csrfToken=$csrfToken&email=admin@example.com&password=your_password&json=true"
Invoke-RestMethod -Method POST -Uri "$BASE_URL/api/auth/callback/credentials" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body $loginBody `
  -WebSession $session

# 1-3. ログイン確認（role が "admin" であることを確認）
Invoke-RestMethod -Method GET -Uri "$BASE_URL/api/auth/session" -WebSession $session
```

---

### Step 2: APIキー発行

```powershell
$body = @{ name = "外部連携システムA" } | ConvertTo-Json
$result = Invoke-RestMethod -Method POST -Uri "$BASE_URL/api/admin/api-keys" `
  -ContentType "application/json" -Body $body -WebSession $session

# 発行されたキーを変数に保存（この1回しか表示されません）
$API_KEY = $result.key
Write-Host "発行されたAPIキー: $API_KEY"
```

---

### Step 3: トレンド投稿

> **注意:** PowerShell では日本語を含む Body を文字列のまま送ると文字化けします。  
> `UTF8.GetBytes()` でバイト列に変換してから送信してください。  
> ターミナルの表示は文字化けしますが、DB・画面への保存は正常です。

```powershell
$headers   = @{ "X-API-Key" = $API_KEY }
$bodyText  = @{ title = "投稿タイトル"; content = "投稿内容" } | ConvertTo-Json
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyText)

Invoke-RestMethod -Method POST -Uri "$BASE_URL/api/v1/trends" `
  -Headers $headers `
  -Body $bodyBytes `
  -ContentType "application/json; charset=utf-8"
```

---

### Step 4: APIキー一覧確認

```powershell
Invoke-RestMethod -Method GET -Uri "$BASE_URL/api/admin/api-keys" -WebSession $session
```

---

### Step 5: APIキー無効化

```powershell
$KEY_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 一覧で確認した id
Invoke-RestMethod -Method DELETE -Uri "$BASE_URL/api/admin/api-keys/$KEY_ID" `
  -WebSession $session
```

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| キー発行で `403` | 未ログインまたは管理者ロールでない | Step 1 を実施。DB で `role = 'admin'` を確認 |
| トレンド投稿で `401` | APIキーが無効または未指定 | キーが `is_active = true` か確認。再発行を検討 |
| ターミナルの表示が文字化け | PowerShell のエンコーディング | `UTF8.GetBytes()` を使用（DB・画面は正常） |
| セッションが切れる | NextAuth の JWT 有効期限切れ | Step 1 からやり直し |
