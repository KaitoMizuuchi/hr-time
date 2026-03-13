---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-13'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/prd-validation-report.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
workflowType: 'architecture'
project_name: 'hr-time'
user_name: 'かいと'
date: '2026-03-13'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
33のFRが8つの機能領域に分類される。コアはタイムライン管理（FR6-14）で、15分単位のタイムブロック配置・編集・計画/実績自動判定がアプリの中心的な操作。タスク管理（FR1-5）とタグ・分類（FR15-18）はデータモデルの基盤。集計・ダッシュボード（FR21-24）とExcel出力（FR25）は読み取り専用のレポーティング層。認証（FR30-33）はメール+パスワード方式。

**Non-Functional Requirements:**
- Performance: タイムブロック操作100ms以内（UI応答）、API応答500ms以内、初期ロード3秒以内、月次集計1秒以内
- Security: パスワードハッシュ化、HTTPS通信、認証トークンによるセッション管理

**Scale & Complexity:**
- Primary domain: フルスタックWeb SPA
- Complexity level: Low（標準的なCRUD + タイムラインUI + レポート出力）
- Estimated architectural components: フロントエンド（SPA）、バックエンドAPI、データベース、認証層、Excel生成サービス

### Technical Constraints & Dependencies

- React + Vite（SPA、クライアントサイドレンダリング）
- TanStack Queryによるサーバー状態管理（DB確定後リフレッシュ方式）
- react-hook-form + zodによるバリデーション
- Tailwind CSS + shadcn/ui（Radix UIベース）
- Biomeによるコード品質管理、vitestによるテスト
- デスクトップ優先（最小1024px）、ブラウザ: Chrome, Safari, Edge, Firefox最新2バージョン
- SEO不要、オフライン不要、リアルタイム同期不要（MVP）

### Cross-Cutting Concerns Identified

- **認証・認可:** 全APIエンドポイントでの認証チェック、未認証リクエストの拒否。セッション切れ時（401）のログイン画面リダイレクト
- **サーバー状態同期:** DB確定後リフレッシュ方式を採用（楽観的更新は不採用）。API呼び出し中はpending状態をUIに表示し、確定後にinvalidateQueriesでリフレッシュ。シンプルさとデータ信頼性を優先
- **計画/実績状態管理:** 現在時刻基準の自動判定ロジック（フロントエンド）、時間経過に伴う自動変換
- **タグ自動付与:** プロジェクト配下タスク作成時のビジネスロジック
- **タスク完了ロック:** 完了ステータス設定時のタイムブロック編集制御
- **タイムブロック重複チェック:** フロントエンド（編集時のWarning Toast案内）とバックエンド（時間帯重複の拒否）の両方で検証。実績延長時に計画ブロックとの衝突をユーザーに通知し、先に移動/削除を促す
- **タイムブロック状態管理の複雑さ:** 計画、実績、ホバー、選択中、編集ロックの5状態 + 休憩ブロックの独自状態。フロントエンドの状態設計に注意が必要

### エラー回復戦略

**レイヤー1: API通信エラー（ネットワーク断・サーバーエラー）**
- DB確定リフレッシュ方式のため、失敗時もデータは壊れない（変更前の状態が維持される）
- Error Toastで「保存に失敗しました。再度お試しください」と表示（手動クローズ）
- リトライボタンは設けず、ユーザーに再操作を委ねる（「ツールは空気」原則）
- API呼び出し中はボタンをdisabled + スピナー表示で二重送信を防止

**レイヤー2: 競合エラー（将来のチーム展開時）**
- MVPでは発生しないが、APIに409 Conflictレスポンスを設計上考慮しておく

**レイヤー3: セッション切れ**
- TanStack Queryのグローバルエラーハンドラーで401を検知 → ログイン画面にリダイレクト
- 未保存の操作は最大1回分のみ（DB確定方式のメリット）

### アーキテクチャ判断メモ

- **日付境界をまたぐタイムブロック:** MVPでは対応しない。将来必要になった時点で追加検討
- **データ保持期間:** 1年を初期方針とする。長期蓄積時のパフォーマンス影響は実測で判断
- **Excel生成:** サーバーサイド（ExcelJS）で生成。クライアントサイドだとバンドルサイズが増えるため。月次データ（数百行程度）の規模ならサーバーサイドが適切

## Starter Template Evaluation

### Technical Preferences

**確定済み（PRD/UX仕様 + 議論から）:**
- 言語: TypeScript
- ランタイム: Bun
- フロントエンド: React + Vite
- UI: Tailwind CSS + shadcn/ui
- 状態管理: TanStack Query（DB確定後リフレッシュ方式）
- フォーム: react-hook-form + zod
- バックエンド: Hono
- ORM: Prisma
- DB: PostgreSQL
- 認証: Better Auth
- コード品質: Biome
- テスト: vitest
- モノレポ: pnpm workspaces
- デプロイ: Railway（$5/月）

### Primary Technology Domain

フルスタックWeb SPA — React + Vite（フロントエンド）+ Hono + Bun（バックエンドAPI）のモノレポ構成

### Starter Options Considered

1. **`create vite` react-ts テンプレート** — フロントエンド用。React + TypeScript + Viteの最小構成
2. **`create-hono` bun テンプレート** — バックエンド用。Hono + Bunの最小構成
3. 既成のフルスタックスターター（T3 Stack等）は検討したが、Bun + Hono + Prismaの組み合わせに合うものがなく不採用

### Selected Approach: 個別テンプレート + pnpm workspacesモノレポ

**Rationale:**
- フルスタックスターターでBun + Hono + Prisma + Better Authの組み合わせに合うものが存在しない
- `create vite`と`create-hono`は十分ミニマルで、不要な依存を持ち込まない
- pnpm workspacesでモノレポを自前構成する方が構成の理解度が高く、カスタマイズが容易

**Initialization Commands:**

```bash
# モノレポルート作成
mkdir hr-time && cd hr-time
pnpm init

# pnpm-workspace.yaml 作成
# packages:
#   - "packages/*"

# フロントエンド
pnpm create vite packages/frontend -- --template react-ts

# バックエンド
pnpm create hono packages/backend -- --template bun

# 共有パッケージ
mkdir -p packages/shared && cd packages/shared && pnpm init
```

### Monorepo Structure

```
hr-time/
├── packages/
│   ├── frontend/      # React + Vite + shadcn/ui + TanStack Query
│   ├── backend/       # Hono + Bun + Prisma + Better Auth
│   │   └── public/    # 本番: frontendのビルド成果物を配置
│   └── shared/        # zodスキーマ、Prisma型の再エクスポート
├── pnpm-workspace.yaml
├── package.json       # ルートスクリプト（dev, build, db:migrate等）
├── biome.json         # モノレポ全体で統一
└── vitest.workspace.ts # テスト設定をワークスペースで統合
```

### Deploy Strategy

**MVP（1サービスデプロイ）:**
- `pnpm build`でfrontendをビルド → 成果物を`backend/public/`にコピー → backendをRailwayにデプロイ
- HonoがAPIルート（`/api/*`）と静的ファイル配信（`/*`）を両方担当
- 同一ドメインのためCORS設定不要
- Railway上で管理するサービスは1つだけ

**将来のチーム展開時（2サービス分離）:**
- `packages/frontend` → Vercel/Cloudflare Pages等に独立デプロイ
- `packages/backend` → Railway単体でAPIのみ
- HonoのserveStaticを外し、CORS設定を追加するだけで移行可能
- モノレポ構成は変更不要

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript（strict mode）
- Bun runtime（バックエンド）、Vite dev server（フロントエンド開発時）

**Styling Solution:**
- Tailwind CSS + shadcn/ui（`pnpm dlx shadcn@latest init`で追加設定）

**Build Tooling:**
- Vite（フロントエンドビルド）
- Bun（バックエンドランタイム、パッケージマネージャとしてはpnpmを使用）

**Testing Framework:**
- vitest（vitest.workspace.tsでモノレポ統合）

**Code Organization:**
- pnpm workspacesによる3パッケージ構成（frontend / backend / shared）
- zodスキーマをsharedで定義し、フロント（react-hook-form）とバック（APIバリデーション）で共有
- Prisma型定義はsharedから再エクスポート（フロントにPrisma依存を持たせない）

**Development Experience:**
- ルートpackage.jsonにdev/build/db:migrateスクリプトを集約
- 開発時はVite HMR（フロント）とHono dev server（API）を別プロセスで起動
- Biomeをモノレポ全体で統一適用

**Note:** プロジェクト初期化とモノレポセットアップが最初の実装ストーリーとなる

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Hono RPC による型安全API通信
- Prisma 7.x + PostgreSQL のデータ層
- Better Auth 1.5.x による認証
- React Router によるルーティング
- Feature-based ディレクトリ構造

**Important Decisions (Shape Architecture):**
- エラーコードの shared 共有
- husky + lint-staged によるコミット時チェック
- GitHub Actions による PR チェック
- リポジトリパターンによるDB操作の分離

**Deferred Decisions (Post-MVP):**
- サーバーサイドキャッシュ（Redis等）
- レート制限
- 外部ログサービス（Sentry等）
- 自動デプロイパイプライン
- E2Eテスト（Playwright）

### Data Architecture

- **DB:** PostgreSQL（Railway）
- **ORM:** Prisma 7.x
- **マイグレーション:** 開発時 `prisma migrate dev`、本番 `prisma migrate deploy`、ファイルはGit管理
- **キャッシュ:** MVP不要。TanStack QueryのstaleTime設定によるクライアントキャッシュのみ
- **データ保持:** 1年を初期方針
- **バリデーション:** zodスキーマをsharedで定義 → フロント（react-hook-form）とバック（Honoミドルウェア）で共有。Prismaスキーマ（DB制約）が最終防衛線

### Authentication & Security

- **認証:** Better Auth 1.5.x（メール + パスワード）
- **セッション管理:** Better Auth ビルトイン
- **API保護:** Better Auth ミドルウェアで全 `/api/*` エンドポイントを保護（`/api/auth/*` を除く）
- **レート制限:** MVP不要

### API & Communication Patterns

- **APIスタイル:** Hono RPC（バックエンドのルート定義からフロントエンドに型が自動伝播）
- **ルーティング規約:**
  - `/api/auth/*` → Better Auth
  - `/api/projects/*` → プロジェクトCRUD
  - `/api/tasks/*` → タスクCRUD
  - `/api/time-blocks/*` → タイムブロックCRUD
  - `/api/tags/*` → タグCRUD
  - `/api/dashboard/*` → 月次集計
  - `/api/export/*` → Excel出力
- **エラーレスポンス統一フォーマット:**
  ```json
  // 成功時
  { "success": true, "data": { ... } }

  // エラー時
  {
    "success": false,
    "error": {
      "code": "TIME_BLOCK_OVERLAP",
      "message": "タイムブロックが重複しています"
    }
  }
  ```
  エラーコードは shared パッケージで const 定義し、フロント・バックで共有
- **レート制限:** MVP不要

### Frontend Architecture

- **ルーティング:** React Router
- **アイコン:** lucide-react
- **ディレクトリ構造:** Feature-based
  ```
  frontend/src/
  ├── features/
  │   ├── auth/          # components/, hooks/, api.ts
  │   ├── tasks/         # components/, hooks/, api.ts
  │   ├── timeline/      # components/, hooks/, api.ts
  │   └── dashboard/     # components/, hooks/, api.ts
  ├── components/        # 共通UIコンポーネント（shadcn/ui）
  ├── lib/               # ユーティリティ、Hono RPCクライアント設定
  ├── types/             # グローバル型定義
  ├── routes/            # ルート定義
  └── App.tsx
  ```
- **API呼び出しパターン:** api.ts（Hono RPC呼び出し）→ hooks/（TanStack Query）→ components/
- **Hono RPC型共有:** frontendの`devDependencies`に`@hr-time/backend: "workspace:*"`を追加。`import type`でランタイム依存なし

### Backend Architecture

- **ディレクトリ構造:**
  ```
  backend/src/
  ├── routes/          # Honoルート定義（リクエスト処理のみ）
  ├── middleware/       # 認証、エラーハンドリング、logger
  ├── services/        # ビジネスロジック（重複チェック、集計計算等）
  ├── repositories/    # Prisma経由のDB操作（CRUD）
  ├── lib/             # ユーティリティ（Excel生成、日付計算等）
  └── index.ts         # エントリーポイント
  ```
- **レイヤー構成:** routes → services → repositories → Prisma → DB
  - routes: リクエスト受付、zodバリデーション、レスポンス返却
  - services: ビジネスロジック（重複チェック、計画/実績判定、集計計算）
  - repositories: 純粋なDB操作（findMany、create、update等）
  - lib: DB無関係のユーティリティ（Excel生成等）

### Infrastructure & Deployment

- **デプロイ:** Railway（$5/月、フロント+API+DB一体、1サービスデプロイ）
- **コミット時チェック:** husky + lint-staged（biome check）+ tsc --noEmit
- **PR時チェック（GitHub Actions）:** biome check + tsc --noEmit + vitest run + ビルドチェック
- **自動デプロイ:** 後日構築
- **環境変数:** `.env.example`をGit管理、`.env`はGit管理外
- **ログ:** Honoビルトインloggerミドルウェア + console.error → Railwayログビューア

### Test Strategy

- **テストフレームワーク:** vitest（vitest.workspace.tsでモノレポ統合）
- **テストピラミッド（MVP）:**
  - **Unit tests（最多）:** services層のビジネスロジック。repositoryをモックしてDB接続なしでテスト
  - **Integration tests（中）:** APIルートのリクエスト→レスポンス検証。Honoの`app.request()`で実行
  - **E2E tests:** MVP不要。将来Playwrightで追加
- **最優先テスト対象:**
  1. タイムブロック重複チェックロジック — バグると全データが壊れる
  2. 計画/実績の自動判定ロジック — ユーザーの信頼に直結
  3. 月次集計の計算 — Excel出力のデータ品質

### Decision Impact Analysis

**実装順序:**
1. モノレポセットアップ + Prismaスキーマ定義
2. Better Auth認証設定
3. Hono APIルート（routes + services + repositories）+ zodバリデーション
4. React Router + Feature-basedディレクトリ構築
5. Hono RPCクライアント接続
6. 各機能のフロント↔バック結合

**パッケージ間依存:**
- shared → frontend, backend が依存
- frontend → shared（zodスキーマ、Prisma型、エラーコード）
- frontend → backend（型のみ、devDependencies経由、`import type`でランタイム依存なし）
- backend → shared（zodスキーマ、エラーコード）

### Verified Technology Versions

| 技術 | バージョン | 確認日 |
|------|-----------|--------|
| Hono | 4.12.7 | 2026-03-13 |
| Prisma | 7.x | 2026-03-13 |
| Better Auth | 1.5.5 | 2026-03-13 |
| TanStack Query | 5.90.x | 2026-03-13 |

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database Naming（Prismaスキーマ）:**
- テーブル名（モデル名）: PascalCase（`Project`, `Task`, `TimeBlock`）
- カラム名: camelCase（`createdAt`, `projectId`）
- 外部キー: `{参照先}Id`（`projectId`, `userId`）
- ID: UUID（Prisma `@default(uuid())`）
- インデックス: Prismaデフォルト自動生成

**API Naming:**
- エンドポイント: 複数形・kebab-case（`/api/time-blocks`）
- ルートパラメータ: `:id`（`/api/tasks/:id`）
- クエリパラメータ: camelCase（`?projectId=xxx&month=2026-03`）

**Code Naming:**
- `.tsx`ファイル名: PascalCase（`TaskList.tsx`, `TimeBlock.tsx`）
- `.tsx`内のコンポーネント関数: PascalCase（`export function TaskList()`）
- `.ts`ファイル名: camelCase（`useTasks.ts`, `api.ts`, `timeBlock.service.ts`）
- テストファイル: camelCase（`timeBlock.service.test.ts`）
- フォルダ名: camelCase（`features/`, `tasks/`, `components/`）
- 関数: camelCase（`getTasks`, `createTimeBlock`）
- 変数: camelCase（`projectId`, `startTime`）
- 定数: UPPER_SNAKE_CASE（`ERROR_CODES`, `TIME_SLOT_MINUTES`）
- 型/インターフェース: PascalCase（`TimeBlock`, `CreateTaskInput`）
- カスタムフック: `use`プレフィックス + camelCase（`useTasks`, `useTimeBlocks`）

**命名ルールまとめ:**
- PascalCase: `.tsx`ファイル名、コンポーネント関数、型/インターフェース、Prismaモデル名のみ
- camelCase: それ以外すべて（フォルダ、`.ts`ファイル、変数、関数、JSONフィールド）
- UPPER_SNAKE_CASE: 定数のみ
- kebab-case: APIエンドポイントのみ

### Structure Patterns

**テスト配置:** コロケーション（同じディレクトリに`.test.ts`を配置）

```
# フロントエンド
features/
├── tasks/
│   ├── components/
│   │   └── TaskList.tsx
│   ├── hooks/
│   │   └── useTasks.ts
│   └── api.ts

# バックエンド
services/
├── timeBlock.service.ts
└── timeBlock.service.test.ts
repositories/
├── timeBlock.repository.ts
└── timeBlock.repository.test.ts
```

**インポートパス:** `@/`エイリアスを使用
```typescript
// ✅ Good
import { useTasks } from '@/features/tasks/hooks/useTasks'

// ❌ Bad
import { useTasks } from '../../../features/tasks/hooks/useTasks'
```

### Format Patterns

**API Response:**
```json
// 成功時
{ "success": true, "data": { ... } }

// エラー時
{
  "success": false,
  "error": {
    "code": "TIME_BLOCK_OVERLAP",
    "message": "タイムブロックが重複しています"
  }
}
```

**Data Exchange:**
- JSONフィールド名: camelCase
- 日時（サーバー↔クライアント間）: ISO 8601 UTC文字列（`"2026-03-13T10:00:00.000Z"`）
- 時間（15分単位表示）: `HH:mm`文字列（`"10:00"`, `"10:15"`）
- ID: UUID文字列
- null: `null`を使用（`undefined`はAPIレスポンスに含めない）

**日時ライブラリ:** Luxon
- タイムゾーン処理がビルトインでUTC↔JST変換に最適
- `packages/shared`に日時ユーティリティを定義しフロント・バックで共有
- UI表示: JST（`Asia/Tokyo`）に変換
- DB保存・API通信: UTC

### Process Patterns

**Loading State:**
- TanStack Queryの`isPending`/`isError`を使用
- ボタン: `disabled` + lucide-reactの`Loader2`（`animate-spin`）
- 全画面遷移: スケルトンUI
- タイムブロック操作: API呼び出し中はpending状態をUIに表示

**Error Handling:**
- バックエンド: Honoのグローバルエラーハンドラーで全エラーを統一フォーマットに変換
- フロントエンド: TanStack Queryの`onError`でToast表示
- 401: グローバルハンドラーでログイン画面リダイレクト
- バリデーションエラー: フィールド直下に赤テキスト表示
- Error Toast: 手動クローズ必須

### Enforcement Guidelines

**All AI Agents MUST:**
- 上記の命名規約に従う（PascalCaseは.tsxファイル・コンポーネント関数・型・Prismaモデルのみ）
- APIレスポンスは必ず`{ success, data/error }`のラッパーフォーマットを使用
- 日時はLuxonで処理し、APIではISO 8601 UTCで送受信
- エラーコードは`packages/shared`の定数を参照（ハードコード禁止）
- テストはコロケーション配置
- インポートは`@/`エイリアスを使用

**Anti-Patterns:**
- ❌ APIレスポンスを直接返す（ラッパーなし）
- ❌ `new Date()`を直接使用（Luxonを使うこと）
- ❌ 相対パスの深いインポート（`../../../`）
- ❌ エラーコードのハードコード文字列
- ❌ `.tsx`以外のファイルにPascalCase
- ❌ `undefined`をAPIレスポンスに含める

## Project Structure & Boundaries

### Complete Project Directory Structure

```
hr-time/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions（lint, typecheck, test, build）
├── packages/
│   ├── frontend/
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   │   └── SignupForm.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useAuth.ts
│   │   │   │   │   └── api.ts
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── TaskList.tsx
│   │   │   │   │   │   ├── TaskDetailModal.tsx
│   │   │   │   │   │   ├── TaskEditModal.tsx
│   │   │   │   │   │   ├── TaskAddModal.tsx
│   │   │   │   │   │   ├── ProjectGroup.tsx
│   │   │   │   │   │   └── SelectCreate.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useTasks.ts
│   │   │   │   │   │   └── useProjects.ts
│   │   │   │   │   └── api.ts
│   │   │   │   ├── timeline/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── TimelineGrid.tsx
│   │   │   │   │   │   ├── TimeBlock.tsx
│   │   │   │   │   │   ├── BreakBlock.tsx
│   │   │   │   │   │   ├── TimeEditPopover.tsx
│   │   │   │   │   │   └── DailySummaryBar.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useTimeBlocks.ts
│   │   │   │   │   └── api.ts
│   │   │   │   └── dashboard/
│   │   │   │       ├── components/
│   │   │   │       │   ├── MonthlyDashboard.tsx
│   │   │   │       │   ├── ProjectSummaryTable.tsx
│   │   │   │       │   └── ExportButton.tsx
│   │   │   │       ├── hooks/
│   │   │   │       │   └── useDashboard.ts
│   │   │   │       └── api.ts
│   │   │   ├── components/            # 共通UI（shadcn/ui）
│   │   │   │   └── ui/               # shadcn/uiコンポーネント
│   │   │   ├── lib/
│   │   │   │   ├── apiClient.ts       # Hono RPCクライアント設定
│   │   │   │   └── queryClient.ts     # TanStack Query設定（グローバルエラーハンドラー含む）
│   │   │   ├── types/                 # グローバル型定義
│   │   │   ├── routes/                # React Routerルート定義
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css              # Tailwind CSSエントリー
│   │   ├── .env                       # VITE_API_URL等（Git管理外）
│   │   ├── .env.example
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── components.json            # shadcn/ui設定
│   ├── backend/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── projects.ts
│   │   │   │   ├── tasks.ts
│   │   │   │   ├── timeBlocks.ts
│   │   │   │   ├── tags.ts
│   │   │   │   ├── dashboard.ts
│   │   │   │   └── export.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts            # Better Auth ミドルウェア
│   │   │   │   ├── errorHandler.ts    # グローバルエラーハンドラー
│   │   │   │   └── logger.ts          # Honoビルトインlogger設定
│   │   │   ├── services/
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── task.service.ts
│   │   │   │   │   └── task.service.test.ts
│   │   │   │   ├── timeline/
│   │   │   │   │   ├── timeBlock.service.ts
│   │   │   │   │   └── timeBlock.service.test.ts
│   │   │   │   ├── tags/
│   │   │   │   │   ├── tag.service.ts
│   │   │   │   │   └── tag.service.test.ts
│   │   │   │   └── dashboard/
│   │   │   │       ├── dashboard.service.ts
│   │   │   │       └── dashboard.service.test.ts
│   │   │   ├── repositories/
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── project.repository.ts
│   │   │   │   │   └── task.repository.ts
│   │   │   │   ├── timeline/
│   │   │   │   │   └── timeBlock.repository.ts
│   │   │   │   ├── tags/
│   │   │   │   │   └── tag.repository.ts
│   │   │   │   └── dashboard/
│   │   │   │       └── dashboard.repository.ts
│   │   │   ├── lib/
│   │   │   │   ├── db.ts              # Prismaクライアント初期化
│   │   │   │   ├── auth.ts            # Better Auth設定
│   │   │   │   └── excel.ts           # ExcelJS によるExcel生成
│   │   │   └── index.ts               # エントリーポイント（Hono app + serveStatic）
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── public/                    # 本番: frontendビルド成果物配置先
│   │   ├── .env                       # DATABASE_URL, BETTER_AUTH_SECRET等（Git管理外）
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/
│       ├── src/
│       │   ├── schemas/               # zodバリデーションスキーマ
│       │   │   ├── project.ts
│       │   │   ├── task.ts
│       │   │   ├── timeBlock.ts
│       │   │   ├── tag.ts
│       │   │   └── auth.ts
│       │   ├── errors/
│       │   │   └── codes.ts           # エラーコード定数定義
│       │   ├── utils/
│       │   │   └── dateTime.ts        # Luxon日時ユーティリティ
│       │   ├── types/                 # Prisma型の再エクスポート
│       │   │   └── index.ts
│       │   └── index.ts               # パッケージエントリー（全エクスポート集約）
│       ├── package.json
│       └── tsconfig.json
├── .gitignore
├── .husky/
│   └── pre-commit                     # biome check + tsc --noEmit
├── biome.json                         # モノレポ全体統一
├── vitest.workspace.ts                # テストワークスペース設定
├── pnpm-workspace.yaml
└── package.json                       # ルートスクリプト + husky + lint-staged
```

### Architectural Boundaries

**API Boundaries:**
- `/api/auth/*` → Better Authが処理（認証境界）
- `/api/*`（auth以外）→ 認証ミドルウェア必須（全リクエストでセッション検証）
- `/*`（API以外）→ 静的ファイル配信（frontend ビルド成果物）

**Layer Boundaries（Backend）:**
- routes → services → repositories → Prisma → DB の一方向依存
- routesはservicesのみ呼び出し可能（repositoriesを直接呼ばない）
- servicesはrepositoriesのみ呼び出し可能（Prismaを直接呼ばない）
- repositories のみがPrismaクライアントに依存

**Package Boundaries:**
- shared → frontend, backend が依存
- frontend → shared（zodスキーマ、Prisma型、エラーコード）
- frontend → backend（型のみ、devDependencies経由、`import type`でランタイム依存なし）
- backend → shared（zodスキーマ、エラーコード）
- frontend は repositories / services を直接参照しない

### Requirements to Structure Mapping

| FR領域 | Frontend | Backend Routes | Backend Services/Repositories | Shared |
|--------|----------|----------------|-------------------------------|--------|
| タスク管理（FR1-5） | `features/tasks/` | `routes/tasks.ts`, `routes/projects.ts` | `services/tasks/`, `repositories/tasks/` | `schemas/task.ts`, `schemas/project.ts` |
| タイムライン管理（FR6-14） | `features/timeline/` | `routes/timeBlocks.ts` | `services/timeline/`, `repositories/timeline/` | `schemas/timeBlock.ts` |
| タグ・分類（FR15-18） | `features/tasks/`内 | `routes/tags.ts` | `services/tags/`, `repositories/tags/` | `schemas/tag.ts` |
| 休憩管理（FR19-20） | `features/timeline/`（BreakBlock） | `routes/timeBlocks.ts` | `services/timeline/` | `schemas/timeBlock.ts` |
| 集計・ダッシュボード（FR21-24） | `features/dashboard/` | `routes/dashboard.ts` | `services/dashboard/`, `repositories/dashboard/` | — |
| レポート出力（FR25） | `features/dashboard/`（ExportButton） | `routes/export.ts` | `lib/excel.ts` | — |
| UI・表示（FR26-29） | `routes/`, `App.tsx`, `components/ui/` | — | — | — |
| 認証（FR30-33） | `features/auth/` | — | `middleware/auth.ts`, `lib/auth.ts` | `schemas/auth.ts` |

### Data Flow

```
[ブラウザ] ← React SPA（features/components/hooks）
    ↓ Hono RPCクライアント（lib/apiClient.ts）
[Hono Routes] → zodバリデーション（shared/schemas）
    ↓
[Services] → ビジネスロジック（重複チェック、集計、自動判定）
    ↓
[Repositories] → Prisma CRUD操作
    ↓
[PostgreSQL（Railway）]
```

### Development Workflow

**開発時:**
```bash
pnpm dev          # backend（Hono + Bun）起動
pnpm dev:frontend # frontend（Vite HMR）起動 → APIはbackendにプロキシ
```

**ビルド・デプロイ:**
```bash
pnpm build        # 1. frontendビルド → backend/public/にコピー
                  # 2. backendビルド
# Railway: backendをデプロイ（1サービス）
```

**DB操作:**
```bash
pnpm db:migrate   # prisma migrate dev
pnpm db:studio    # prisma studio（DB GUI）
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
全技術選定が互いに矛盾なく動作する。React + Vite（SPA）→ Hono RPC（型安全API）→ Prisma 7.x（ORM）→ PostgreSQL の流れが一貫。Bun ランタイムで Hono + Prisma が問題なく動作し、Better Auth 1.5.x は Prisma adapter経由で統合。TanStack Query の DB確定後リフレッシュ方式は Hono RPC のレスポンス型と自然に連携。

**Pattern Consistency:**
命名規則（キャメルケース統一、tsx/コンポーネントのみパスカルケース）がフロントエンド・バックエンド・shared全域で一貫。Feature-based構造（frontend）とレイヤード構造（backend: routes → services → repositories）が明確に分離され、共にzodスキーマをsharedから参照する統一パターン。

**Structure Alignment:**
モノレポ（pnpm workspaces）の3パッケージ構成がアーキテクチャ決定を忠実にサポート。shared パッケージがスキーマ・エラーコード・型・日時ユーティリティの一元管理拠点として機能。Hono RPCの`import type`によるfrontend→backend型参照がdevDependenciesで正しく設定。

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR領域 | カバー状況 | アーキテクチャサポート |
|--------|-----------|---------------------|
| タスク管理（FR1-5） | ✅ 完全 | features/tasks/ + routes/services/repositories |
| タイムライン管理（FR6-14） | ✅ 完全 | features/timeline/ + routes/services/repositories、重複チェック（F+B両方） |
| タグ・分類（FR15-18） | ✅ 完全 | features/tasks/内 + routes/tags.ts + services/repositories |
| 休憩管理（FR19-20） | ✅ 完全 | BreakBlock component + timeBlocks routes |
| 集計・ダッシュボード（FR21-24） | ✅ 完全 | features/dashboard/ + dashboard routes/services |
| レポート出力（FR25） | ✅ 完全 | lib/excel.ts（ExcelJS、サーバーサイド生成） |
| UI・表示（FR26-29） | ✅ 完全 | App.tsx + React Router + shadcn/ui |
| 認証（FR30-33） | ✅ 完全 | Better Auth + middleware/auth.ts + features/auth/ |

**Non-Functional Requirements Coverage:**
- Performance: TanStack Query キャッシュ + Hono 軽量フレームワーク + PostgreSQLインデックス戦略で対応
- Security: Better Auth（セッション管理）+ 認証ミドルウェア（全APIルート）+ zodバリデーション（入力検証）

### Implementation Readiness Validation ✅

**Decision Completeness:**
全技術選定にバージョン指定あり（React 19, Hono 4.x, Prisma 7.x, Better Auth 1.5.x等）。実装パターンにコード例付き。一貫性ルールが明確で強制可能。

**Structure Completeness:**
全ディレクトリ・ファイルが定義済み。integration point（Hono RPC型共有、shared zodスキーマ、Better Auth Prisma adapter）が明確に指定。

**Pattern Completeness:**
エラーハンドリング3層戦略、命名規則、ファイル構成パターン、テスト戦略が網羅的に文書化。

### Gap Analysis Results

**Critical Gaps:** なし

**Important Gaps:**
- Vite proxy設定（開発時のAPI転送）が未文書化 → 実装着手時に`vite.config.ts`の`server.proxy`設定を追加すれば対応可能。ブロッキングではない

**Nice-to-Have Gaps:**
- 環境変数一覧（DATABASE_URL, BETTER_AUTH_SECRET等）の明示的なリスト → .env.exampleで対応可能

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Hono RPCによるフロントエンド⇔バックエンドの型安全な通信（コード生成不要）
- 明確なレイヤー分離（routes → services → repositories）でテスタビリティ確保
- shared パッケージによるスキーマ・型・エラーコードの一元管理
- Railway 1サービスデプロイによる運用シンプルさ
- DB確定後リフレッシュ方式によるデータ信頼性

**Areas for Future Enhancement:**
- Phase 2以降でのモバイル対応時にレスポンシブデザイン拡張
- チーム開発移行時にフロントエンド・バックエンド分離デプロイへの段階的移行
- 負荷増加時のキャッシュ戦略（Redis等）追加

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
1. モノレポセットアップ（pnpm workspaces + 3パッケージ初期化）
2. Prisma スキーマ定義 + マイグレーション
3. Better Auth 統合
4. 基本ルート・サービス・リポジトリのスキャフォールド
