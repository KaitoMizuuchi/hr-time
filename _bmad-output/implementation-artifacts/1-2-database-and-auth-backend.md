# Story 1.2: データベースと認証バックエンド

Status: ready-for-dev

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

- [ ] Task 0: Docker ComposeでローカルPostgreSQL構築 (AC: #1 前提)
  - [ ] プロジェクトルートに`docker-compose.yml`を作成（PostgreSQL 16、ポート5432、DB名`hr_time`、ユーザー`postgres`、パスワード`postgres`）
  - [ ] `packages/backend/.env`を作成し`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hr_time`を設定
  - [ ] `.gitignore`に`.env`が含まれていることを確認（既存エントリで対応済みのはず）
  - [ ] `docker compose up -d`でPostgreSQLが起動することを確認
  - [ ] ルート`package.json`に`"db:up": "docker compose up -d"`, `"db:down": "docker compose down"`スクリプトを追加

- [ ] Task 1: Prisma 7.x + PostgreSQL セットアップ (AC: #1)
  - [ ] `pnpm add prisma @prisma/client @prisma/adapter-pg pg dotenv --filter @hr-time/backend`
  - [ ] `pnpm add @types/pg -D --filter @hr-time/backend`
  - [ ] `packages/backend/prisma/schema.prisma`を作成 — **重要: Prisma 7.xではdatasourceに`url`を書かない。providerのみ指定**
  - [ ] `packages/backend/prisma.config.ts`を作成 — Prisma CLIのDB接続設定（`import "dotenv/config"` + `defineConfig` + `datasource.url: env("DATABASE_URL")`）
  - [ ] generatorは`prisma-client`（旧`prisma-client-js`は非推奨）、output先は`../src/generated/prisma`
  - [ ] Userモデル（id: UUID, name, email @unique, emailVerified, image?, createdAt, updatedAt）
  - [ ] Sessionモデル（id, expiresAt, token @unique, ipAddress?, userAgent?, userId → User, createdAt, updatedAt）
  - [ ] Accountモデル（id, accountId, providerId, userId → User, accessToken?, refreshToken?, idToken?, accessTokenExpiresAt?, refreshTokenExpiresAt?, scope?, password?, createdAt, updatedAt）
  - [ ] Verificationモデル（id, identifier, value, expiresAt, createdAt, updatedAt）
  - [ ] `pnpm db:migrate`でマイグレーション実行
  - [ ] `packages/backend/src/lib/db.ts` — PrismaClient初期化（`PrismaPg`アダプター使用、`connectionString: process.env.DATABASE_URL!`）
  - [ ] `.gitignore`に`packages/backend/src/generated`を追加（Prisma生成ファイルはGit管理外）

- [ ] Task 2: Better Auth 1.5.x 設定 (AC: #2, #3, #4)
  - [ ] `pnpm add better-auth --filter @hr-time/backend`
  - [ ] `packages/backend/src/lib/auth.ts` — Better Auth設定（prismaAdapter、emailAndPassword: enabled）
  - [ ] Better AuthのHonoハンドラーを`/api/auth/**`にマウント（`app.on(["POST", "GET"], "/api/auth/**", ...)` + `auth.handler(c.req.raw)`）
  - [ ] `.env`に`BETTER_AUTH_SECRET`（32文字以上）と`BETTER_AUTH_URL=http://localhost:3000`を追加

- [ ] Task 3: 認証ミドルウェア (AC: #5)
  - [ ] `packages/backend/src/middleware/auth.ts` — `auth.api.getSession({ headers })`で検証、未認証なら401
  - [ ] `/api/*`（`/api/auth/*`を除く）に認証ミドルウェアを適用
  - [ ] 認証済みリクエストで`c.set("user", session.user)`としてコンテキストにユーザー情報を格納

- [ ] Task 4: グローバルエラーハンドラー (AC: #6)
  - [ ] `packages/backend/src/middleware/errorHandler.ts` — `app.onError()`で統一フォーマット`{ success: false, error: { code, message } }`
  - [ ] `app.notFound()`で404も統一フォーマット

- [ ] Task 5: sharedパッケージにスキーマ・エラーコード追加
  - [ ] `pnpm add zod --filter @hr-time/shared`
  - [ ] `packages/shared/src/schemas/auth.ts` — signUpSchema（name, email, password）、signInSchema（email, password）
  - [ ] `packages/shared/src/errors/codes.ts` — ERROR_CODES定数（UNAUTHORIZED, NOT_FOUND, INTERNAL_ERROR, VALIDATION_ERROR, CONFLICT）
  - [ ] `packages/shared/src/index.ts`から全エクスポート

- [ ] Task 6: index.tsルート再構成 (AC: #1-#7)
  - [ ] `packages/backend/src/index.ts`にBetter Authルート、認証ミドルウェア、エラーハンドラーを統合
  - [ ] loggerミドルウェアは既存のものを維持
  - [ ] `/api/health`は認証ミドルウェア配下に移動

- [ ] Task 7: テスト (AC: #1-#6)
  - [ ] `packages/backend/src/middleware/errorHandler.test.ts` — エラーハンドラー単体テスト（DB不要）
  - [ ] 認証APIのインテグレーションテスト — PostgreSQL接続が必要。環境変数の読み込み方法に注意（後述）
  - [ ] 既存テスト（`/api/health`の200確認）を認証ミドルウェア追加に伴い更新（401になる）

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

### File List
