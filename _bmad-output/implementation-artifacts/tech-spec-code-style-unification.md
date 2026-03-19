---
title: 'コードスタイル統一リファクタリング'
slug: 'code-style-unification'
created: '2026-03-19'
status: 'done'
stepsCompleted: [1, 2, 3, 4]
tech_stack: [TypeScript, React, Hono, vitest v3, Bun]
files_to_modify: [vitest.workspace.ts, packages/backend/src/middleware/auth.ts, packages/backend/src/lib/db.ts, packages/backend/src/lib/auth.integration.test.ts, packages/frontend/src/App.tsx, packages/frontend/src/lib/utils/cn.ts, packages/frontend/src/components/ui/form-field.tsx, packages/frontend/src/routes/index.tsx, packages/frontend/src/routes/ProtectedRoute.tsx, packages/frontend/src/pages/LoginPage.tsx, packages/frontend/src/pages/SignupPage.tsx, packages/frontend/src/pages/TasksPage.tsx, packages/frontend/src/pages/DashboardPage.tsx, packages/frontend/src/features/auth/hooks/useAuth.ts, packages/frontend/src/features/auth/components/LoginForm.tsx, packages/frontend/src/features/auth/components/SignupForm.tsx]
code_patterns: ['export const arrowFn', '@/ path alias', './同ディレクトリ相対パス']
test_patterns: ['vitest v3 resolve.alias with new URL()']
---

# Tech-Spec: コードスタイル統一リファクタリング

**Created:** 2026-03-19

## Overview

### Problem Statement

backendで`../`相対インポートが混在しており、アーキテクチャで定めた`@/`パスエイリアスとの一貫性がない。また、frontend/backend全体で`export function`と`export const`アロー関数が混在しており、コードスタイルが統一されていない。

### Solution

1. backendの`../`インポートを`@/`パスエイリアスに統一（`./`同ディレクトリ参照はそのまま）
2. vitest.workspace.tsにbackend用の`resolve.alias`を追加してテストでも`@/`を解決可能にする
3. 全パッケージの`export function`を`export const`アロー関数に統一

### Scope

**In Scope:**
- backendの`../`相対インポート → `@/`パスエイリアスへの変換
- vitest.workspace.tsにbackend alias追加
- frontend/backend/sharedの`export function` → `export const`アロー関数への変換

**Out of Scope:**
- shadcn/ui生成コンポーネント（button.tsx, input.tsx, label.tsx, card.tsx）
- Prisma生成ファイル（src/generated/）
- `./`同ディレクトリ内の相対インポート（これはそのまま維持）

## Context for Development

### Codebase Patterns

- frontendはViteが`@/`を解決（vite.config.tsのresolve.alias）
- backendはBunランタイムがtsconfig.jsonのpathsで`@/`を解決
- vitestはv3で`resolve.alias` + `new URL()`方式で`@/`を解決
- frontendのalias設定は`vitest.workspace.ts`に既存。backendにも同じパターンで追加する

### Files to Reference

| File | 変更内容 |
| ---- | ------- |
| vitest.workspace.ts | backend用`resolve.alias`追加 |
| packages/backend/src/middleware/auth.ts | `../lib/auth` → `@/lib/auth` + export const化 |
| packages/backend/src/lib/db.ts | `../generated/prisma/client` → `@/generated/prisma/client` |
| packages/backend/src/lib/auth.integration.test.ts | `../index` → `@/index` |
| packages/frontend/src/App.tsx | export const化 |
| packages/frontend/src/lib/utils/cn.ts | export const化 |
| packages/frontend/src/components/ui/form-field.tsx | export const化 |
| packages/frontend/src/routes/index.tsx | export const化 |
| packages/frontend/src/routes/ProtectedRoute.tsx | export const化 |
| packages/frontend/src/pages/LoginPage.tsx | export const化 |
| packages/frontend/src/pages/SignupPage.tsx | export const化 |
| packages/frontend/src/pages/TasksPage.tsx | export const化 |
| packages/frontend/src/pages/DashboardPage.tsx | export const化 |
| packages/frontend/src/features/auth/hooks/useAuth.ts | export const化 |
| packages/frontend/src/features/auth/components/LoginForm.tsx | export const化 |
| packages/frontend/src/features/auth/components/SignupForm.tsx | export const化 |

### Technical Decisions

- `./`同ディレクトリ参照はそのまま維持（`./db`, `./errorHandler`等）
- `../`別ディレクトリ参照のみ`@/`に変換
- shadcn/ui生成ファイルは変更しない（再生成時に上書きされるため）
- vitest.workspace.tsのbackend aliasはfrontendと同じ`new URL()`方式を使用

## Implementation Plan

### Tasks

- [x] Task 1: vitest.workspace.tsにbackend alias追加
  - File: `vitest.workspace.ts`
  - Action: backend defineConfigに`resolve.alias`を追加（`"@/": new URL("./packages/backend/src/", import.meta.url).pathname`）

- [x] Task 2: backendの`../`インポートを`@/`に変換
  - File: `packages/backend/src/middleware/auth.ts`
  - Action: `from "../lib/auth"` → `from "@/lib/auth"`
  - File: `packages/backend/src/lib/db.ts`
  - Action: `from "../generated/prisma/client"` → `from "@/generated/prisma/client"`
  - File: `packages/backend/src/lib/auth.integration.test.ts`
  - Action: `from "../index"` → `from "@/index"`

- [x] Task 3: backendの`export function`を`export const`に変換
  - File: `packages/backend/src/middleware/auth.ts`
  - Action: `export async function authMiddleware(...)` → `export const authMiddleware = async (...) =>`

- [x] Task 4: frontendの`export function`を`export const`に変換
  - File: `packages/frontend/src/App.tsx` — `App`
  - File: `packages/frontend/src/lib/utils/cn.ts` — `cn`
  - File: `packages/frontend/src/components/ui/form-field.tsx` — `FormField`
  - File: `packages/frontend/src/routes/index.tsx` — `AppRoutes`
  - File: `packages/frontend/src/routes/ProtectedRoute.tsx` — `ProtectedRoute`
  - File: `packages/frontend/src/pages/LoginPage.tsx` — `LoginPage`
  - File: `packages/frontend/src/pages/SignupPage.tsx` — `SignupPage`
  - File: `packages/frontend/src/pages/TasksPage.tsx` — `TasksPage`
  - File: `packages/frontend/src/pages/DashboardPage.tsx` — `DashboardPage`
  - File: `packages/frontend/src/features/auth/hooks/useAuth.ts` — `useAuth`
  - File: `packages/frontend/src/features/auth/components/LoginForm.tsx` — `LoginForm`
  - File: `packages/frontend/src/features/auth/components/SignupForm.tsx` — `SignupForm`

- [x] Task 5: テスト実行・型チェック
  - Action: `pnpm test`で全17テストがパスすることを確認
  - Action: `pnpm exec tsc -b`で型チェックがパスすることを確認

### Acceptance Criteria

- [ ] AC 1: Given backendソースコード, when `../`でgrepする, then `src/generated/`以外にマッチしない（`./`は許容）
- [ ] AC 2: Given vitest.workspace.ts, when backendテストを実行する, then `@/`インポートが正しく解決されてテストがパスする
- [ ] AC 3: Given 全ソースコード（shadcn/ui・Prisma生成除外）, when `export function`でgrepする, then マッチしない
- [ ] AC 4: Given 全テスト, when `pnpm test`を実行する, then 全17テストがパスする
- [ ] AC 5: Given 全パッケージ, when 型チェックを実行する, then エラーがない

## Additional Context

### Dependencies

- なし（既存の依存のみ）

### Testing Strategy

- 既存の全17テストがリグレッションなしでパスすることを確認
- 新規テストの追加は不要（機能変更なし）

### Notes

- Reactコンポーネントの`export const`化により、React DevToolsでの表示名が匿名になる可能性あり。必要に応じて`displayName`を設定するか、named arrow functionパターン（`export const App = () => {}`）で対応
- 今後新規ファイルを作成する際は`export const`で統一する
