# Story 1.3: サインアップ・ログインUI

Status: review

## Story

As a ユーザー,
I want ブラウザからアカウント登録とログインができる,
so that アプリにアクセスして利用を開始できる.

## Acceptance Criteria

1. **Given** 未認証状態でアプリにアクセスする **When** ページが表示される **Then** ログイン画面が表示される
2. **Given** ログイン画面 **When** 「サインアップ」リンクをクリックする **Then** サインアップ画面に遷移する（表示名+メール+パスワード+確認パスワード入力フィールド）
3. **Given** サインアップ画面で有効な情報を入力する **When** 「サインアップ」ボタンをクリックする **Then** アカウントが作成され、タスク画面に遷移する
4. **Given** サインアップ画面で無効な入力（空欄、パスワード不一致等） **When** 入力中にバリデーションが発動する **Then** フィールド直下に赤テキストでエラーが表示される（UX-DR19） **And** バリデーション通過までサインアップボタンは非アクティブ
5. **Given** ログイン画面で登録済みのメール+パスワードを入力する **When** 「ログイン」ボタンをクリックする **Then** 認証が成功し、タスク画面に遷移する
6. **Given** ログイン画面で誤ったパスワードを入力する **When** 「ログイン」ボタンをクリックする **Then** エラーメッセージが表示され、再入力が促される
7. **And** Hono RPCクライアント（lib/apiClient.ts）が設定される
8. **And** TanStack Query（lib/queryClient.ts）がグローバルエラーハンドラー（401→ログインリダイレクト）付きで設定される
9. **And** react-hook-form + zodでフォームバリデーションが実装される
10. **And** shadcn/uiが初期化される（Button, Input, Toast等の基本コンポーネント）
11. **And** Clean Minimalデザイン（slate-50背景、sky-400〜500アクセント）が適用される（UX-DR1）

## Tasks / Subtasks

- [x] Task 1: shadcn/ui初期化 + Tailwind CSS設定 (AC: #10, #11)
  - [x] Tailwind CSS v4 + @tailwindcss/viteプラグイン設定
  - [x] shadcn/ui初期化（Button, Input, Label, Card, Sonner）
  - [x] Clean Minimalカラーカスタマイズ（slate系背景、sky-400〜500アクセント）
  - [x] biome.jsonにtailwindDirectives: true追加
  - [x] .vscode/settings.jsonでCSS unknownAtRules警告抑制
  - [x] FormFieldコンポーネント作成（Label + Input + エラーメッセージ）
  - [x] Toaster（Sonner）をtop-center配置、エラー/成功/警告の色分け

- [x] Task 2: Hono RPCクライアント設定 (AC: #7)
  - [x] hono追加、`lib/apiClient.ts`でhc<AppType>クライアント作成
  - [x] backend package.jsonにmain/types追加で型解決

- [x] Task 3: TanStack Query設定 (AC: #8)
  - [x] @tanstack/react-query追加
  - [x] `lib/queryClient.ts`でグローバルエラーハンドラー（401→リダイレクト）設定
  - [x] main.tsxにQueryClientProviderラップ

- [x] Task 4: React Router設定 (AC: #1)
  - [x] react-router追加
  - [x] ルート定義（/login, /signup, /tasks, /dashboard）
  - [x] App.tsxにBrowserRouter + AppRoutes + Toaster設定

- [x] Task 5: 認証フック + Better Authクライアント (AC: #1, #3, #5)
  - [x] better-auth追加（クライアントSDK）
  - [x] `lib/authClient.ts`でcreateAuthClient設定（baseURL: window.location.origin）
  - [x] `features/auth/hooks/useAuth.ts`でsignUp/signIn/signOut/session管理
  - [x] エラーメッセージの日本語マッピング（AUTH_ERROR_MESSAGES）
  - [x] backend auth.tsにtrustedOrigins追加（開発時CORS対応）

- [x] Task 6: サインアップ画面 (AC: #2, #3, #4)
  - [x] SignupForm.tsx — react-hook-form + zodResolver + signUpFormSchema
  - [x] 確認パスワードフィールド（refineで一致チェック）
  - [x] absoluteエラーメッセージ、disabled+スピナー、Toast通知

- [x] Task 7: ログイン画面 (AC: #1, #5, #6)
  - [x] LoginForm.tsx — react-hook-form + zodResolver + signInSchema
  - [x] エラー時Toast表示（日本語）、disabled+スピナー

- [x] Task 8: ページコンポーネント + 保護ルート (AC: #1)
  - [x] LoginPage, SignupPage, TasksPage（placeholder）, DashboardPage（placeholder）
  - [x] ProtectedRoute — useAuthで認証チェック、未認証→/loginリダイレクト

- [x] Task 9: テスト
  - [x] LoginForm.test.tsx — 4テスト（表示、disabled、バリデーション、リンク）
  - [x] SignupForm.test.tsx — 4テスト（表示、disabled、パスワード不一致、リンク）
  - [x] vitest v3にダウングレード（v4はfrontendの@/エイリアス非対応）
  - [x] vitest.workspace.tsでfrontendにresolve.alias設定
  - [x] 全7ファイル17テストパス

- [ ] Task 9: テスト
  - [ ] LoginForm単体テスト — バリデーションエラー表示、ボタン非アクティブ状態
  - [ ] SignupForm単体テスト — バリデーションエラー表示、パスワード不一致エラー
  - [ ] 全既存テストが引き続きパスすることを確認

## Dev Notes

### アーキテクチャ準拠要件

**[Source: architecture.md#Frontend Architecture]**
```
frontend/src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── api.ts
├── components/        # 共通UIコンポーネント（shadcn/ui）
│   └── ui/
├── lib/
│   ├── apiClient.ts   # Hono RPCクライアント設定
│   └── queryClient.ts # TanStack Query設定
├── routes/            # ルート定義
├── App.tsx
├── main.tsx
└── index.css          # Tailwind CSSエントリー
```

**[Source: architecture.md#API & Communication Patterns]**
- APIスタイル: Hono RPC（バックエンドのルート定義からフロントエンドに型が自動伝播）
- API呼び出しパターン: api.ts（Hono RPC呼び出し）→ hooks/（TanStack Query）→ components/
- Hono RPC型共有: frontendの`devDependencies`に`@hr-time/backend: "workspace:*"`を追加済み。`import type`でランタイム依存なし

**[Source: architecture.md#Naming Patterns]**
- `.tsx`ファイル名: PascalCase（`LoginForm.tsx`, `SignupForm.tsx`）
- `.ts`ファイル名: camelCase（`useAuth.ts`, `apiClient.ts`）
- フォルダ名: camelCase（`features/`, `auth/`, `components/`）
- コンポーネント関数: PascalCase（`export function LoginForm()`）
- カスタムフック: `use`プレフィックス（`useAuth`）
- インポート: `@/`エイリアスを使用（frontendはViteが解決するため動作する）

### 技術スタック・バージョン

| 技術 | バージョン | 備考 |
|------|-----------|------|
| React | 19.2.4 | インストール済み |
| Vite | 8.0.0 | インストール済み |
| React Router | 最新v7系 | 新規インストール |
| TanStack Query | 5.x | 新規インストール |
| react-hook-form | 最新 | 新規インストール |
| @hookform/resolvers | 最新 | zodResolver用 |
| shadcn/ui | latest | `pnpm dlx shadcn@latest init` |
| Tailwind CSS | v4系 | shadcn/ui initで自動設定 |
| better-auth (client) | 1.5.5 | クライアントSDK |
| lucide-react | 最新 | shadcn/ui依存、アイコン |

### Hono RPCクライアントの設定

```typescript
// packages/frontend/src/lib/apiClient.ts
import { hc } from "hono/client"
import type { AppType } from "@hr-time/backend"

export const api = hc<AppType>("/")
```

**注意:** Vite proxy経由でAPIにアクセスするため、ベースURLは`"/"`でOK。開発時は`vite.config.ts`の`server.proxy`が`/api`をbackend（localhost:3000）に転送する。

### TanStack Queryのグローバルエラーハンドラー

```typescript
// packages/frontend/src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        // 401検知 → ログインリダイレクト
        if (error instanceof Response && error.status === 401) {
          window.location.href = "/login"
        }
      },
    },
  },
})
```

### Better Auth クライアントSDK

Better Auth 1.5.xはフロントエンド用のクライアントSDKを提供している。`better-auth/react`からReact用フックも利用可能。

```typescript
// packages/frontend/src/lib/authClient.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: "/api/auth",
})
```

これにより`authClient.signUp.email()`, `authClient.signIn.email()`, `authClient.signOut()`, `authClient.useSession()`等が使える。Hono RPCクライアントとは別に、認証系はBetter Authクライアントを直接使用する。

### フォームバリデーション設計

```typescript
// react-hook-form + zodResolver
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema } from "@hr-time/shared"

const form = useForm({
  resolver: zodResolver(signUpSchema),
  // ...
})
```

**確認パスワード:** sharedのsignUpSchemaにはpasswordConfirmがないため、フロントエンド側でsignUpSchemaを拡張する：
```typescript
const signUpFormSchema = signUpSchema.extend({
  passwordConfirm: z.string().min(1, "確認パスワードは必須です"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "パスワードが一致しません",
  path: ["passwordConfirm"],
})
```

### UXデザイン要件

**[Source: ux-design-specification.md#Visual Design Foundation]**
- 背景: slate-50（青みがかった白）
- アクセント: sky-400〜sky-500（水色）
- フォーカス時: 水色アウトライン
- ボタン: Primary = 水色背景+白テキスト
- エラー: フィールド直下に赤テキスト
- フォント: システムフォントスタック or Inter/Noto Sans JP

**[Source: ux-design-specification.md#Form Patterns]**
- リアルタイムバリデーション
- エラーはフィールド直下にabsolute配置で赤テキスト（後続要素がずれない）
- 送信ボタンはバリデーション通過後のみアクティブ
- フォーカス時に水色アウトライン

**[Source: ux-design-specification.md#Loading Patterns]**
- ボタン: disabled + lucide-react Loader2（animate-spin）
- Error Toast: 手動クローズ必須

**[Source: ux-design-specification.md#User Journey 0: 認証フロー]**
- ログイン/サインアップは最小限のフィールド
- 認証後は即タスク画面に遷移（チュートリアルなし）

### 前のストーリーからの学び

**Story 1.1:**
- frontendは`@/`パスエイリアスが`vite.config.ts`で設定済み（Viteが解決するのでvitest問題なし）
- `@hr-time/backend`がdevDependenciesにあり`import type`で型参照可能

**Story 1.2:**
- Better Auth 1.5.5がbackendにセットアップ済み
- `/api/auth/**`ルートが動作中（sign-up/email, sign-in/email, sign-out, session等）
- 認証ミドルウェアが`/api/*`（auth以外）に適用済み → 未認証で401
- エラーレスポンスは統一フォーマット`{ success: false, error: { code, message } }`
- backendではvitest + `@/`エイリアス問題があったが、frontendはViteが解決するため問題なし
- テスト実行は`pnpm test`（dotenv-cli経由でenv変数注入）

### ファイル構造要件

```
packages/frontend/
├── src/
│   ├── features/
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── LoginForm.tsx     # (new)
│   │       │   └── SignupForm.tsx    # (new)
│   │       └── hooks/
│   │           └── useAuth.ts        # (new)
│   ├── components/
│   │   └── ui/                       # (new) shadcn/ui生成コンポーネント
│   ├── lib/
│   │   ├── apiClient.ts              # (new)
│   │   ├── queryClient.ts            # (new)
│   │   └── authClient.ts             # (new)
│   ├── pages/
│   │   ├── LoginPage.tsx             # (new)
│   │   ├── SignupPage.tsx            # (new)
│   │   ├── TasksPage.tsx             # (new) placeholder
│   │   └── DashboardPage.tsx         # (new) placeholder
│   ├── routes/
│   │   ├── index.tsx                 # (new)
│   │   └── ProtectedRoute.tsx        # (new)
│   ├── App.tsx                       # (modify)
│   ├── main.tsx                      # (modify)
│   └── index.css                     # (modify — Tailwind CSS)
├── components.json                   # (new) shadcn/ui設定
├── package.json                      # (modify)
└── tailwind.config.ts                # (new, if needed by shadcn)
```

### アンチパターン防止

- **禁止:** `@hr-time/backend`をruntimeで`import`する（`import type`のみ許可）
- **禁止:** APIレスポンスの`undefined`チェック漏れ（`null`を使う規約）
- **禁止:** `new Date()`の直接使用（Luxon推奨、ただしこのストーリーでは日時操作なし）
- **禁止:** 相対パスの深いインポート（`@/`エイリアスを使用）
- **禁止:** エラーコードのハードコード文字列（shared/errors/codes.tsの定数を使用）
- **禁止:** shadcn/uiコンポーネントのカスタマイズ時にTailwindクラス以外を使用

### References

- [Source: architecture.md#Frontend Architecture] — ディレクトリ構造、API呼び出しパターン
- [Source: architecture.md#API & Communication Patterns] — Hono RPC設定
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — 命名規則
- [Source: architecture.md#Process Patterns] — ローディング・エラーハンドリング
- [Source: epics.md#Story 1.3] — ストーリー定義とAC
- [Source: ux-design-specification.md#Visual Design Foundation] — カラー・タイポグラフィ
- [Source: ux-design-specification.md#Form Patterns] — フォームバリデーションUX
- [Source: ux-design-specification.md#User Journey 0] — 認証フロー
- [Source: 1-1-project-base-setup.md] — frontend構成、パスエイリアス
- [Source: 1-2-database-and-auth-backend.md] — Better Auth API、認証ミドルウェア

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- shadcn/ui init: tsconfig.jsonにbaseUrl+pathsが必要（tsconfig.app.jsonだけでは不足）
- Tailwind CSS v4: biome.jsonに`tailwindDirectives: true`が必要（@apply解析用）
- Better Auth client: baseURLに相対パス不可 → `window.location.origin`を使用
- Better Auth CORS: 開発時はfrontend(5173)とbackend(3000)のポート不一致 → `trustedOrigins`追加
- vitest v4: frontendの`@/`エイリアスが全く解決不可（forks/vmThreads/vite-tsconfig-paths全て失敗）
- vitest v3: `resolve.alias` + `new URL("./src/", import.meta.url).pathname`で`@/`解決可能
- shadcn/ui Button: CardTitleのテキストとボタンのテキストが一致する場合、getByRoleで複数マッチ → type="submit"で絞り込み

### Completion Notes List

- shadcn/ui + Tailwind CSS v4初期化、Clean Minimalカラー適用
- Hono RPCクライアント（hc<AppType>）設定
- TanStack Query + グローバル401ハンドラー設定
- React Router（/login, /signup, /tasks, /dashboard）+ ProtectedRoute
- Better Authクライアント + useAuthフック（日本語エラーマッピング付き）
- LoginForm / SignupForm（react-hook-form + zod + absoluteエラー表示）
- FormFieldコンポーネント（再利用可能なLabel+Input+Error）
- Toaster: top-center配置、success/warning/errorの色分け
- pnpm devで両サーバー同時起動
- vitest v3ダウングレード + @/エイリアス解決
- 全7ファイル17テストパス

### Change Log

- 2026-03-19: Story 1.3 実装完了 — サインアップ・ログインUI

### File List

- .vscode/settings.json (new)
- biome.json (modify — css tailwindDirectives追加)
- vitest.workspace.ts (modify — frontend resolve.alias追加)
- package.json (modify — dev両サーバー同時起動、vitest v3、vite-tsconfig-paths追加)
- packages/frontend/package.json (modify — 多数の依存追加)
- packages/frontend/components.json (new — shadcn/ui設定)
- packages/frontend/tsconfig.json (modify — baseUrl+paths追加)
- packages/frontend/vite.config.ts (modify — tailwindcss plugin追加)
- packages/frontend/src/index.css (modify — Tailwind CSS v4 + Clean Minimalカラー)
- packages/frontend/src/App.tsx (modify — BrowserRouter + AppRoutes + Toaster)
- packages/frontend/src/main.tsx (modify — QueryClientProvider追加)
- packages/frontend/src/lib/utils/cn.ts (new — shadcn用cnユーティリティ)
- packages/frontend/src/lib/apiClient.ts (new — Hono RPCクライアント)
- packages/frontend/src/lib/queryClient.ts (new — TanStack Query設定)
- packages/frontend/src/lib/authClient.ts (new — Better Authクライアント)
- packages/frontend/src/components/ui/button.tsx (new — shadcn)
- packages/frontend/src/components/ui/input.tsx (new — shadcn)
- packages/frontend/src/components/ui/label.tsx (new — shadcn)
- packages/frontend/src/components/ui/card.tsx (new — shadcn)
- packages/frontend/src/components/ui/toaster.tsx (new — Sonner、旧sonner.tsx)
- packages/frontend/src/components/ui/form-field.tsx (new — FormField共通コンポーネント)
- packages/frontend/src/features/auth/hooks/useAuth.ts (new)
- packages/frontend/src/features/auth/components/LoginForm.tsx (new)
- packages/frontend/src/features/auth/components/LoginForm.test.tsx (new)
- packages/frontend/src/features/auth/components/SignupForm.tsx (new)
- packages/frontend/src/features/auth/components/SignupForm.test.tsx (new)
- packages/frontend/src/pages/LoginPage.tsx (new)
- packages/frontend/src/pages/SignupPage.tsx (new)
- packages/frontend/src/pages/TasksPage.tsx (new — placeholder)
- packages/frontend/src/pages/DashboardPage.tsx (new — placeholder)
- packages/frontend/src/routes/index.tsx (new)
- packages/frontend/src/routes/ProtectedRoute.tsx (new)
- packages/backend/package.json (modify — main/types追加)
- packages/backend/src/lib/auth.ts (modify — trustedOrigins追加)
