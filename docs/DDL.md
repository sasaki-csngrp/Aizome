# Aizome データベース DDL/DML

## 概要
Aizomeアプリケーションのデータベース構造とマスターデータの移行用SQL文

## テーブル作成順序
外部キー制約があるため、以下の順序でテーブルを作成する必要があります：

1. users (基本テーブル)
2. avatars (マスターテーブル)
3. quests (マスターテーブル)
4. accounts, sessions, verification_token, authenticators (NextAuth)
5. reports, learning_contents (コンテンツテーブル)
6. user_learned_contents, user_cleared_quests, likes (関連テーブル)

## 1. シーケンス作成

```sql
-- avatarsテーブル用のシーケンス
CREATE SEQUENCE avatars_id_seq;
```

## 2. テーブル作成

### users テーブル
```sql
CREATE TABLE users (
    id text NOT NULL DEFAULT gen_random_uuid(),
    name text,
    email text NOT NULL,
    "emailVerified" timestamp with time zone,
    image text,
    "hashedPassword" text,
    nickname text,
    bio text,
    total_points integer NOT NULL DEFAULT 0,
    avatar_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    role text DEFAULT 'user'::text,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

### avatars テーブル
```sql
CREATE TABLE avatars (
    id integer NOT NULL DEFAULT nextval('avatars_id_seq'::regclass),
    name text NOT NULL,
    image_url text NOT NULL,
    CONSTRAINT avatars_pkey PRIMARY KEY (id)
);
```

### quests テーブル
```sql
CREATE TABLE quests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    points integer NOT NULL,
    trigger_event character varying(50),
    target_id uuid,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quests_pkey PRIMARY KEY (id)
);
```

### accounts テーブル (NextAuth)
```sql
CREATE TABLE accounts (
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    CONSTRAINT accounts_pkey PRIMARY KEY (provider, "providerAccountId"),
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);
```

### sessions テーブル (NextAuth)
```sql
CREATE TABLE sessions (
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp with time zone NOT NULL,
    CONSTRAINT sessions_pkey PRIMARY KEY ("sessionToken"),
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);
```

### verification_token テーブル (NextAuth)
```sql
CREATE TABLE verification_token (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp with time zone NOT NULL,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (identifier, token)
);
```

### authenticators テーブル (NextAuth)
```sql
CREATE TABLE authenticators (
    "credentialID" text NOT NULL,
    "userId" text NOT NULL,
    provideraccountid text NOT NULL,
    credentialpublickey text NOT NULL,
    counter integer NOT NULL,
    credentialdevicetype text NOT NULL,
    credentialbackedup boolean NOT NULL,
    transports text,
    CONSTRAINT authenticators_pkey PRIMARY KEY ("credentialID"),
    CONSTRAINT "authenticators_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);
```

### reports テーブル
```sql
CREATE TABLE reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    author_id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    type character varying(50) NOT NULL DEFAULT 'report'::character varying,
    CONSTRAINT reports_pkey PRIMARY KEY (id),
    CONSTRAINT "reports_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id)
);
```

### learning_contents テーブル
```sql
CREATE TABLE learning_contents (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    difficulty integer NOT NULL DEFAULT 1,
    prerequisite_content_id uuid,
    is_public boolean NOT NULL DEFAULT false,
    author_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT learning_contents_pkey PRIMARY KEY (id),
    CONSTRAINT "learning_contents_author_id_fkey" FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT "learning_contents_prerequisite_content_id_fkey" FOREIGN KEY (prerequisite_content_id) REFERENCES learning_contents(id)
);
```

### user_learned_contents テーブル
```sql
CREATE TABLE user_learned_contents (
    user_id text NOT NULL,
    content_id uuid NOT NULL,
    learned_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_learned_contents_pkey PRIMARY KEY (user_id, content_id),
    CONSTRAINT "user_learned_contents_content_id_fkey" FOREIGN KEY (content_id) REFERENCES learning_contents(id),
    CONSTRAINT "user_learned_contents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### user_cleared_quests テーブル
```sql
CREATE TABLE user_cleared_quests (
    user_id text NOT NULL,
    quest_id uuid NOT NULL,
    cleared_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_cleared_quests_pkey PRIMARY KEY (user_id, quest_id, cleared_at),
    CONSTRAINT "user_cleared_quests_quest_id_fkey" FOREIGN KEY (quest_id) REFERENCES quests(id),
    CONSTRAINT "user_cleared_quests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### likes テーブル
```sql
CREATE TABLE likes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    report_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT likes_pkey PRIMARY KEY (id),
    CONSTRAINT likes_user_id_report_id_key UNIQUE (user_id, report_id),
    CONSTRAINT "likes_report_id_fkey" FOREIGN KEY (report_id) REFERENCES reports(id),
    CONSTRAINT "likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 3. マスターデータ挿入

### avatars テーブルのデータ
```sql
-- シーケンスの現在値を設定
SELECT setval('avatars_id_seq', 3, true);

-- avatarsデータの挿入
INSERT INTO avatars (id, name, image_url) VALUES
(1, 'Default Avatar', '/avatars/avatar-01.png'),
(2, 'Robot', '/avatars/avatar-02.png'),
(3, 'Star', '/avatars/avatar-03.png');
```

### quests テーブルのデータ
```sql
-- questsデータの挿入
INSERT INTO quests (id, title, description, category, points, trigger_event, target_id, is_active, created_at, updated_at) VALUES
('0f742b97-8fdd-45a9-b75b-543415689d61', '「AI学習のはじめに」を最後までクリアしよう', '全ての「はじめに」をクリアして、AI学習をロケットスタートする準備をしましょう！', 'learning', 100, 'content_learned', '1f649aaa-2e0d-4e90-b5e9-16c0c8c86060', true, '2025-09-06 05:52:13.979493+00', '2025-09-06 05:52:13.979493+00'),
('28f3032e-33f3-4a85-94b1-898ab4e9a78d', '知識を広めよう', 'あなたの知識をみんなにシェア！レポートを1つ投稿しよう。', 'weekly', 50, 'report_posted', NULL, true, '2025-09-06 05:51:51.509647+00', '2025-09-06 05:51:51.509647+00'),
('4f7e22c8-2ed0-4969-94e3-dae23d193fed', 'プロフィールを登録しよう', 'まずはAizomeの世界への第一歩！プロフィールを完成させよう。', 'tutorial', 50, 'profile_updated', NULL, true, '2025-09-06 05:51:50.964406+00', '2025-09-06 05:51:50.964406+00'),
('77baab2d-5d9b-4c00-a126-de9ac854b833', 'レポートに「いいね」をしてみよう', '気になるレポートを応援！「いいね」を1つ押してみよう。', 'tutorial', 10, 'report_liked', NULL, true, '2025-09-06 05:51:51.138994+00', '2025-09-06 05:51:51.138994+00'),
('c3b79237-3667-4449-8864-98074513fac2', 'みんなの学びを応援！', '共感したレポートに「いいね」を1つつけよう。', 'daily', 10, 'report_liked', NULL, true, '2025-09-06 05:51:51.424608+00', '2025-09-06 05:51:51.424608+00'),
('e85fa996-9e41-49ac-a9cd-b15f80b5e23c', 'トレンドを参照してみよう', 'AIの最新情報をキャッチ！トレンド記事を1つ読んでみよう。', 'tutorial', 10, 'trend_read', NULL, true, '2025-09-06 05:51:51.054258+00', '2025-09-06 05:51:51.054258+00'),
('f32721bf-fb96-448a-a287-7a21742f721c', '今日のAIニュース', '毎日更新！最新のAIニュースをチェックしよう。', 'daily', 10, 'trend_read', NULL, true, '2025-09-06 05:51:51.323879+00', '2025-09-06 05:51:51.323879+00'),
('fbae5311-802d-4eac-89ea-17d9a3bcf251', 'ひとつAI学習をクリアしてみよう', 'AI知識を体系的に学ぶ第一歩。AI学習コンテンツを1つクリアしよう。', 'tutorial', 20, 'content_learned', NULL, true, '2025-09-06 05:51:51.236823+00', '2025-09-06 05:51:51.236823+00'),
('fdd796c4-554b-4547-8fa1-20e031c41b5c', '「AI学習のはじめに」をひとつクリアしよう', 'AI学習コンテンツのスタートとして「はじめに」を1つクリアし、基礎知識を身につけよう。', 'learning', 20, 'content_learned', '76541b43-9b44-4a00-b058-5084be075a1d', true, '2025-09-06 05:52:03.460425+00', '2025-09-06 05:52:03.460425+00');
```

## 4. 実行順序

新環境で以下の順序で実行してください：

1. シーケンス作成
2. テーブル作成（上記の順序で）
3. マスターデータ挿入（avatars → quests）

## 注意事項

- 外部キー制約があるため、テーブル作成順序を守ってください
- UUIDは固定値を使用しているため、新環境でも同じIDが生成されます
- シーケンスの現在値は3に設定されています
- 日時はUTC形式で保存されています
