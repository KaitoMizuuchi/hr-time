# Story 1.2: データベースと認証バックエンド

Status: done

## Story

As a ユーザー,
I want アカウント登録・ログイン・ログアウトのAPIが動作する,
so that 安全にアプリを利用できる.

## Acceptance Criteria

1. **Given** バックエンドが起動している **When** Prismaスキーマを定義してマイグレーションを実行する **Then** PostgreSQL上にUserテーブル（nameフィールド含む）とBetter Auth必要テーブルが作成される
2. **Given** 未登録のメールアドレス **When** `/api/auth/sign-up`に表示名+メール+パスワードでリクエストする **Then** アカウントが作成され、セッションが返される **And** パスワードはハッシュ化されて保存される（NFR5）
3. **Given** 登録済みのメールアドレスとパスワード **When** `/api/auth/sign-in`にリクエストする **Then** 認証が成功し、セッションが返される
4. **Given** 認証済みセッション **When** `/api/auth/sign-out`にリクエストする **Then** セッションが無効化される
5. **Given** 認証されていないリクエスト **When** `/api/*`（auth以外）にアクセスする **Then** 401エラーが返される（NFR8）
6. **And** Honoグローバルエラーハンドラーが統一フォーマット`{ success, data/error }`でレスポンスを返す
7. **And** Honoビルトインloggerミドルウェアが設定される

## Tasks / Subtasks

- [x] Task 0: Docker ComposeでローカルPostgreSQL構築 (AC: #1 前提)
  - [x] プロジェクトルートに`docker-compose.yml`を作成（PostgreSQL 16、ポート5432、DB名`hr_time`、ユーザー`postgres`、パスワード`postgres`）
  - [x] `packages/backend/.env`を作成し`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hr_time`を設定
  - [x] `.gitignore`に`.env`が含まれていることを確認（既存エントリで対応済み）
  - [x] `docker compose up -d`でPostgreSQLが起動することを確認
  - [x] ルート`package.json`に`"db:up": "docker compose up -d"`, `"db:down": "docker compose down"`スクリプトを追加

- [x] Task 1: Prisma 7.x + PostgreSQL セットアップ (AC: #1)
  - [x] `pnpm add prisma @prisma/client @prisma/adapter-pg pg dotenv --filter @hr-time/backend`
  - [x] `pnpm add @types/pg -D --filter @hr-time/backend`
  - [x] `packages/backend/prisma/schema.prisma`を作成（Prisma 7.x: datasourceはproviderのみ）
  - [x] `packages/backend/prisma.config.ts`を作成（Prisma CLI用DB接続設定）
  - [x] generator: `prisma-client`、output: `../src/generated/prisma`
  - [x] User, Session, Account, Verificationモデルを定義
  - [x] `pnpm db:migrate`でマイグレーション実行（20260319045805_init）
  - [x] `packages/backend/src/lib/db.ts` — PrismaClient初期化（PrismaPgアダプター使用）
  - [x] `.gitignore`に`packages/backend/src/generated`を追加

- [x] Task 2: Better Auth 1.5.x 設定 (AC: #2, #3, #4)
  - [x] `pnpm add better-auth --filter @hr-time/backend`（v1.5.5）
  - [x] `packages/backend/src/lib/auth.ts` — Better Auth設定（prismaAdapter、emailAndPassword: enabled）
  - [x] `.env`にBETTER_AUTH_SECRET（32文字以上）とBETTER_AUTH_URL追加

- [x] Task 3: 認証ミドルウェア (AC: #5)
  - [x] `packages/backend/src/middleware/auth.ts` — getSessionで検証、未認証なら401
  - [x] `/api/*`（`/api/auth/*`を除く）に認証ミドルウェアを適用
  - [x] 認証済みリクエストでc.set("user"), c.set("session")

- [x] Task 4: グローバルエラーハンドラー (AC: #6)
  - [x] `packages/backend/src/middleware/errorHandler.ts` — 統一フォーマット
  - [x] `app.notFound()`で404も統一フォーマット

- [x] Task 5: sharedパッケージにスキーマ・エラーコード追加
  - [x] `pnpm add zod --filter @hr-time/shared`
  - [x] `packages/shared/src/schemas/auth.ts` — signUpSchema、signInSchema
  - [x] `packages/shared/src/errors/codes.ts` — ERROR_CODES定数
  - [x] `packages/shared/src/index.ts`から全エクスポート

- [x] Task 6: index.tsルート再構成 (AC: #1-#7)
  - [x] Better Authルート、認証ミドルウェア、エラーハンドラーを統合
  - [x] loggerミドルウェアは既存のものを維持
  - [x] `/api/health`は認証ミドルウェア配下に移動

- [x] Task 7: テスト (AC: #1-#6)
  - [x] `packages/backend/src/middleware/errorHandler.test.ts` — エラーハンドラー単体テスト（2テスト）
  - [x] `packages/backend/src/index.test.ts` — 認証ミドルウェア401テスト + Better Authヘルスチェック（2テスト）
  - [x] 全4ファイル6テストパス（frontend 2, backend 4, shared 0）

## Dev Notes

### Prisma 7.x 破壊的変更（実装トライから判明）

**重要: アーキテクチャドキュメントはPrisma 7.xの新しい設定方式を反映していない。以下が正しい設定。**

1. **datasource.urlの廃止:** `schema.prisma`に`url = env("DATABASE_URL")`を書くとエラー。代わりに`prisma.config.ts`でDB接続を設定する
2. **generatorの変更:** `prisma-client-js` → `prisma-client`に名称変更
3. **出力先の変更:** Prisma Clientはデフォルトでプロジェクトローカルディレクトリに生成（`node_modules`ではない）。`output = "../src/generated/prisma"`を指定
4. **ドライバーアダプター必須:** PrismaClientにネイティブNode.jsドライバーアダプター（`@prisma/adapter-pg` + `pg`）を渡す必要がある
5. **インポートパス変更:** `@prisma/client`ではなく生成先パスからインポート（`../generated/prisma/client`）
6. **dotenv自動ロード廃止:** `.env`は自動読み込みされない。`prisma.config.ts`で`import "dotenv/config"`が必要

**schema.prisma の正しい書き方（Prisma 7.x）:**
```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

**prisma.config.ts:**
```typescript
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
})
```

**db.ts（PrismaClient初期化）:**
```typescript
import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })
```

### vitest + Node.js ESM でのパスエイリアス問題

**`@/`エイリアスはvitest v4（Node.js ESM環境）で動作しない。** Node.js ESMは`@/`をスコープドパッケージとして解釈し、Viteのresolve.aliasが効かない。

**対策:** backendのソースファイルでは相対インポート（`./lib/auth`, `../middleware/auth`等）を使用する。tsconfig.jsonの`@/`パスエイリアスはBunランタイム時に使えるが、vitest互換性のため相対パスで統一する。

### vitest + DB接続テストの環境変数問題

vitestはforkプロセスでテストを実行するため、vitest.config.tsでdotenvを設定しても子プロセスに伝搬しない場合がある。

**対策オプション:**
1. テスト実行時にインラインでenv変数を渡す（`DATABASE_URL=... pnpm vitest run`で動作確認済み）
2. ルートpackage.jsonのtestスクリプトでenv変数を設定
3. db.ts内でdotenvを条件付きロードする（`if (!process.env.DATABASE_URL) { ... }`）
4. vitest.config.tsでglobalSetupを使用する

### アーキテクチャ準拠要件

**[Source: architecture.md#Backend Architecture]**
```
backend/src/
├── routes/          # Honoルート定義
├── middleware/       # 認証、エラーハンドリング
├── services/        # ビジネスロジック
├── repositories/    # Prisma経由のDB操作
├── lib/
│   ├── db.ts        # PrismaClient初期化
│   └── auth.ts      # Better Auth設定
└── index.ts         # エントリーポイント
```

**[Source: architecture.md#API & Communication Patterns]**
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "認証が必要です" } }
```

### 技術スタック・バージョン

| 技術 | バージョン | 備考 |
|------|-----------|------|
| Prisma | 7.5.0 | prisma.config.ts必須、adapter-pg必須 |
| Better Auth | 1.5.5 | Prismaアダプター内蔵 |
| Hono | 4.12.8 | インストール済み |
| zod | 最新安定版 | sharedに追加 |
| pg | 8.x | Prisma 7.xドライバーアダプター用 |

### Docker Compose設計

```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: hr_time
    volumes:
      - hr_time_data:/var/lib/postgresql/data

volumes:
  hr_time_data:
```

### 前のストーリー（1.1）からの学び

- backendは手動構成済み。パッケージ追加は`pnpm add`で直接行う
- Biome 2.4.8使用中（v2系）、vitest 4.1.0使用中
- backendのtsconfig.jsonに`@/`パスエイリアス設定済みだが、**vitestでは動作しないため相対インポートを使う**
- backendはBun runtime（`bun run --hot`で開発サーバー起動）。Bunは`.env`を自動読み込みする
- `.env.example`にDATABASE_URL, BETTER_AUTH_SECRET, PORT=3000が既存

### ファイル構造要件

```
hr-time/
├── docker-compose.yml             # (new) ローカルPostgreSQL
├── packages/backend/
│   ├── prisma/
│   │   ├── schema.prisma          # (new)
│   │   └── migrations/            # (new)
│   ├── prisma.config.ts           # (new) Prisma 7.x CLI設定
│   ├── src/
│   │   ├── generated/prisma/      # (new, gitignore) Prisma生成ファイル
│   │   ├── lib/
│   │   │   ├── db.ts              # (new)
│   │   │   └── auth.ts            # (new)
│   │   ├── middleware/
│   │   │   ├── auth.ts            # (new)
│   │   │   └── errorHandler.ts    # (new)
│   │   ├── index.ts               # (modify)
│   │   └── index.test.ts          # (modify)
│   ├── package.json               # (modify)
│   └── .env                       # (new, gitignore)
├── packages/shared/
│   ├── src/
│   │   ├── schemas/auth.ts        # (new)
│   │   ├── errors/codes.ts        # (new)
│   │   └── index.ts               # (modify)
│   └── package.json               # (modify)
├── .gitignore                     # (modify)
└── package.json                   # (modify)
```

### アンチパターン防止

- **禁止:** `schema.prisma`に`url = env("DATABASE_URL")`を書く（Prisma 7.xエラー）
- **禁止:** `prisma-client-js`をgenerator providerに指定（`prisma-client`を使う）
- **禁止:** `@prisma/client`からインポート（生成パスからインポートする）
- **禁止:** backendソースで`@/`エイリアス使用（vitest非互換。相対パスを使う）
- **禁止:** エラーコードのハードコード文字列（shared/errors/codes.tsの定数を使用）
- **禁止:** APIレスポンスを`{ success, data/error }`ラッパーなしで返す

### References

- [Source: architecture.md#Data Architecture]
- [Source: architecture.md#Authentication & Security]
- [Source: architecture.md#Backend Architecture]
- [Source: architecture.md#API & Communication Patterns]
- [Source: epics.md#Story 1.2]
- [Source: 1-1-project-base-setup.md#Dev Agent Record]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Prisma 7.5.0: schema.prismaのdatasource.url廃止 → prisma.config.ts必須
- Prisma 7.5.0: generator `prisma-client-js` → `prisma-client`に名称変更
- Prisma 7.5.0: @prisma/adapter-pg + pgドライバー必須（Rustエンジン廃止）
- vitest v4 + Node.js ESM: `@/`エイリアスが動作しない（スコープドパッケージとして解釈される） → 相対インポートで統一
- vitest v4: forkプロセスでテスト実行のため、vitest.config.tsのdotenvロードが子プロセスに伝搬しない問題あり

### Completion Notes List

- Docker Compose（PostgreSQL 16）でローカルDB構築、pnpm db:up/db:downスクリプト追加
- Prisma 7.5.0 + PostgreSQL: User/Session/Account/Verificationテーブル作成、PrismaPgアダプターでクライアント初期化
- Better Auth 1.5.5: email+password認証、/api/auth/**ルートにマウント
- 認証ミドルウェア: 未認証リクエストに401統一フォーマット応答
- グローバルエラーハンドラー: 500/404を統一フォーマット{ success, error }で応答
- shared: zodスキーマ（signUp/signIn）、ERROR_CODES定数をエクスポート
- テスト: 全4ファイル6テストパス

### Change Log

- 2026-03-19: Story 1.2 実装完了 — DB・認証・ミドルウェア・shared拡張

### File List

- docker-compose.yml (new)
- .gitignore (modify)
- package.json (modify — db:up, db:down追加)
- packages/backend/prisma/schema.prisma (new)
- packages/backend/prisma/migrations/20260319045805_init/migration.sql (new)
- packages/backend/prisma.config.ts (new)
- packages/backend/src/generated/prisma/ (new, gitignore)
- packages/backend/src/lib/db.ts (new)
- packages/backend/src/lib/auth.ts (new)
- packages/backend/src/middleware/auth.ts (new)
- packages/backend/src/middleware/errorHandler.ts (new)
- packages/backend/src/middleware/errorHandler.test.ts (new)
- packages/backend/src/index.ts (modify)
- packages/backend/src/index.test.ts (modify)
- packages/backend/package.json (modify — prisma, better-auth等追加)
- packages/backend/src/lib/auth.integration.test.ts (new)
- packages/backend/.env (new, gitignore)
- packages/backend/.env.example (modify — BETTER_AUTH_URL追加)
- packages/shared/src/schemas/auth.ts (new)
- packages/shared/src/errors/codes.ts (new)
- packages/shared/src/index.ts (modify)
- packages/shared/package.json (modify — zod追加)
