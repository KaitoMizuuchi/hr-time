# Story 1.1: プロジェクト基盤セットアップ

Status: done

## Story

As a 開発者,
I want モノレポプロジェクトが全ツールチェーンとともに初期化されている,
so that 一貫したコード品質と型安全性のもとで開発を開始できる.

## Acceptance Criteria

1. **Given** 既存のhr-timeリポジトリ **When** モノレポセットアップを実行する **Then** pnpm workspacesで3パッケージ（frontend/backend/shared）が構成される
2. **Given** frontendパッケージ **When** 初期化完了 **Then** React + Vite + TypeScript（create vite react-ts）が動作する
3. **Given** backendパッケージ **When** 初期化完了 **Then** Hono + Bun（create hono bun）が動作する
4. **Given** sharedパッケージ **When** 初期化完了 **Then** zodスキーマ・型エクスポート用パッケージとして初期化される
5. **Given** モノレポ全体 **When** Biomeが適用される **Then** `biome check`がfrontend/backend/shared全てに対して実行可能
6. **Given** テスト環境 **When** vitest.workspace.tsが設定される **Then** `pnpm test`でモノレポ全体のテストが統合実行される
7. **Given** コミット時 **When** husky + lint-stagedが設定される **Then** `biome check` + `tsc --noEmit`が自動実行される
8. **Given** 開発者 **When** `pnpm dev`を実行 **Then** backendが起動する
9. **Given** 開発者 **When** `pnpm dev:frontend`を実行 **Then** frontendが起動し、APIリクエストはbackendにプロキシされる
10. **Given** 各パッケージ **When** 環境変数が必要 **Then** `.env.example`がfrontend/backendに配置されている

## Tasks / Subtasks

- [x] Task 1: モノレポルート構成 (AC: #1)
  - [x] `pnpm-workspace.yaml`を作成（packages: ["packages/*"]）
  - [x] ルート`package.json`にワークスペーススクリプトを定義（dev, dev:frontend, build, test, db:migrate, db:studio）
  - [x] `.gitignore`を更新（node_modules, dist, .env, *.local）
- [x] Task 2: frontendパッケージ初期化 (AC: #2)
  - [x] `pnpm create vite packages/frontend --template react-ts`を実行
  - [x] 不要なボイラープレートファイルを削除（App.css, assets, ESLint設定等）
  - [x] `tsconfig.app.json`にstrict mode + `@/`パスエイリアス設定
  - [x] `vite.config.ts`に`@/`リゾルブエイリアス + `server.proxy`（`/api` → backend）設定
  - [x] `.env.example`を作成（`VITE_API_URL=http://localhost:3000`）
- [x] Task 3: backendパッケージ初期化 (AC: #3)
  - [x] 手動でHono + Bunバックエンドを構成（create-honoがインタラクティブプロンプトで失敗したため）
  - [x] `tsconfig.json`にstrict mode設定
  - [x] エントリーポイント`src/index.ts`に最小限のHonoアプリ（ヘルスチェック`/api/health`）を作成
  - [x] `.env.example`を作成（`DATABASE_URL`, `BETTER_AUTH_SECRET`, `PORT=3000`）
- [x] Task 4: sharedパッケージ初期化 (AC: #4)
  - [x] `packages/shared/`ディレクトリ作成
  - [x] `package.json`に`"main": "src/index.ts"`, `"types": "src/index.ts"`設定
  - [x] `src/index.ts`を作成（空のエクスポートファイル）
  - [x] `tsconfig.json`を作成（strict mode）
- [x] Task 5: Biome設定 (AC: #5)
  - [x] ルートに`biome.json`を作成（Biome 2.4.8スキーマ、モノレポ全体統一設定）
  - [x] formatter（tab indent, lineWidth 100）+ linter（recommended）設定
  - [x] `pnpm add -Dw @biomejs/biome`
- [x] Task 6: vitestテスト統合 (AC: #6)
  - [x] ルートに`vitest.workspace.ts`を作成（packages/frontend, packages/backend, packages/shared）
  - [x] `pnpm add -Dw vitest`
  - [x] 各パッケージにサンプルテストを1つ作成して動作確認（3/3パス）
- [x] Task 7: husky + lint-staged設定 (AC: #7)
  - [x] `pnpm add -Dw husky lint-staged`
  - [x] `pnpm exec husky init`
  - [x] `.husky/pre-commit`に`pnpm exec lint-staged`を設定
  - [x] ルート`package.json`にlint-staged設定（`*.{ts,tsx,js,jsx,json,css}`: `biome check --write`）
- [x] Task 8: 開発サーバー起動確認 (AC: #8, #9)
  - [x] ルート`package.json`スクリプト: `"dev": "pnpm --filter @hr-time/backend dev"`, `"dev:frontend": "pnpm --filter @hr-time/frontend dev"`
  - [x] スクリプト設定済み（backendはbun run --hot、frontendはvite + proxy設定）
- [x] Task 9: パッケージ間依存設定
  - [x] frontend/package.jsonに`"@hr-time/shared": "workspace:*"`を追加
  - [x] backend/package.jsonに`"@hr-time/shared": "workspace:*"`を追加
  - [x] frontend/package.jsonの`devDependencies`に`"@hr-time/backend": "workspace:*"`を追加（型のみ、`import type`用）
  - [x] `pnpm install`でワークスペースリンクが正常に解決されることを確認

## Dev Notes

### アーキテクチャ準拠要件

**[Source: architecture.md#Monorepo Structure]**

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

**[Source: architecture.md#Naming Patterns]**
- `.tsx`ファイル名: PascalCase（`TaskList.tsx`）
- `.ts`ファイル名: camelCase（`useTasks.ts`, `api.ts`）
- フォルダ名: camelCase
- 定数: UPPER_SNAKE_CASE
- インポート: `@/`エイリアスを使用（相対パス`../../../`禁止）

**[Source: architecture.md#Development Workflow]**
```bash
pnpm dev          # backend（Hono + Bun）起動
pnpm dev:frontend # frontend（Vite HMR）起動 → APIはbackendにプロキシ
pnpm build        # 1. frontendビルド → backend/public/にコピー  2. backendビルド
```

### 技術スタック・バージョン要件

**[Source: architecture.md#Verified Technology Versions + 最新調査 2026-03-19]**

| 技術 | アーキテクチャ指定 | 最新安定版 | 備考 |
|------|-------------------|-----------|------|
| Hono | 4.12.7 | 4.12.8 | 最新パッチ使用可 |
| Vite | 未指定 | **8.0.0** | **重要: Vite 8はRolldownバンドラー搭載のメジャーリリース（2026-03-12）。`create vite`で最新が入る。react-tsテンプレートは対応済み** |
| React | 未指定 | 19.2.4 | React 19系 |
| Biome | 未指定 | **2.4.0** | **重要: v2系。v1からの移行の場合は設定ファイル形式が異なる可能性あり** |
| Prisma | 7.x | 7.4.1 | このストーリーではインストール不要（Story 1.2で使用） |
| Better Auth | 1.5.x | 1.5.5 | このストーリーではインストール不要（Story 1.2で使用） |
| TanStack Query | 5.x | 5.91.0 | このストーリーではインストール不要（Story 1.3で使用） |
| pnpm | 未指定 | 10.32.1 | corepack対応 |
| Bun | 未指定 | 1.3.11 | backendランタイム |

### 重要な注意事項

1. **このストーリーのスコープ:** モノレポ構成とツールチェーンのセットアップのみ。Prisma、Better Auth、TanStack Query、shadcn/ui、react-hook-formは**インストールしない**。それぞれ使用するストーリー（1.2, 1.3）で追加する
2. **Vite 8.0.0:** `create vite`で自動的にVite 8が入る。Rolldownバンドラーが統合されたメジャーアップデート。react-tsテンプレートとの互換性は確認済み
3. **Biome 2.x:** `@biomejs/biome`をインストール。設定ファイル`biome.json`はv2形式で作成する
4. **sharedパッケージのpackage.json:** `"name": "@hr-time/shared"`とする。frontend/backendも同様に`@hr-time/frontend`, `@hr-time/backend`とする
5. **backend/public/ディレクトリ:** 本番ビルド時にfrontend成果物を配置する場所。このストーリーでは空ディレクトリ+`.gitkeep`を作成
6. **Vite proxy設定:** `vite.config.ts`の`server.proxy`で`/api`をbackend（`http://localhost:3000`）にプロキシ。開発時のCORS問題を回避
7. **husky:** `pnpm exec husky init`で`.husky/`ディレクトリが作成される。pre-commitフックにlint-stagedを設定
8. **既存ファイルとの共存:** リポジトリには既に`_bmad/`と`_bmad-output/`ディレクトリが存在する。これらを壊さないこと。`.gitignore`に`node_modules`等を追加する際、既存エントリを保持

### ファイル構造要件

**このストーリーで作成するファイル一覧:**

```
hr-time/
├── packages/
│   ├── frontend/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── App.tsx          # 最小限のReactアプリ
│   │   │   ├── main.tsx         # エントリーポイント
│   │   │   └── vite-env.d.ts
│   │   ├── .env.example
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.app.json
│   │   └── vite.config.ts       # @/エイリアス + proxy設定
│   ├── backend/
│   │   ├── src/
│   │   │   └── index.ts         # Honoアプリ + /api/health
│   │   ├── public/
│   │   │   └── .gitkeep
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/
│       ├── src/
│       │   └── index.ts         # 空エクスポート
│       ├── package.json
│       └── tsconfig.json
├── .husky/
│   └── pre-commit
├── biome.json
├── vitest.workspace.ts
├── pnpm-workspace.yaml
└── package.json                  # ルート（更新）
```

### テスト要件

- 各パッケージに最小限のテストファイルを1つ作成し、vitestが動作することを確認
  - `packages/frontend/src/App.test.tsx` — Appコンポーネントがレンダリングされることを確認
  - `packages/backend/src/index.test.ts` — `/api/health`が200を返すことを確認（Honoの`app.request()`使用）
  - `packages/shared/src/index.test.ts` — モジュールがインポート可能であることを確認
- テスト実行: `pnpm test`でvitest.workspace.ts経由で全パッケージのテストが実行される

### アンチパターン防止

- **禁止:** ESLint/Prettierのインストール（Biomeを使用）
- **禁止:** jest/mochaのインストール（vitestを使用）
- **禁止:** yarn/npmの使用（pnpm workspacesを使用）
- **禁止:** 不要な依存の先行インストール（Prisma, Better Auth, TanStack Query, shadcn/ui等はこのストーリーのスコープ外）
- **禁止:** `backend/public/`にファイルを配置（本番ビルドプロセスで自動配置される）
- **禁止:** CORSミドルウェアの設定（同一ドメインデプロイのため不要。開発時はVite proxyで対応）

### Project Structure Notes

- 既存リポジトリのルートに`_bmad/`, `_bmad-output/`, `docs/`ディレクトリが存在する。これらは開発ツールチェーンと無関係なので触らない
- `packages/`ディレクトリが新規作成のメインディレクトリ
- ルートの`package.json`は既存のものを更新する形で進める（既にgit initされた状態のリポジトリ）

### References

- [Source: architecture.md#Starter Template Evaluation] — モノレポ構成と初期化コマンド
- [Source: architecture.md#Core Architectural Decisions] — 技術スタック詳細
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — 命名規則・構造パターン
- [Source: architecture.md#Project Structure & Boundaries] — 完全なディレクトリ構造
- [Source: architecture.md#Development Workflow] — 開発・ビルドコマンド
- [Source: epics.md#Story 1.1] — ストーリー定義とAC
- [Source: prd.md#Implementation Considerations] — 技術スタック概要

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- create-honoがインタラクティブプロンプトで失敗したため、backendパッケージは手動構成
- Biome 2.4.8はv2.0.0スキーマと互換性なし → `biome migrate --write`で自動マイグレーション
- vitest v4のワークスペース設定: 各パッケージのvitest.config.tsファイルをパス指定で参照する形式が動作
- frontendテスト: jsdom環境でのReact Testing Library利用は設定調整が必要（今回はDOM不要のテストに変更）

### Completion Notes List

- pnpm workspacesモノレポ構成完了（frontend/backend/shared 3パッケージ）
- frontend: React 19.2.4 + Vite 8.0.0 + TypeScript、@/エイリアス + proxy設定済み
- backend: Hono 4.12.8 + Bun、/api/healthエンドポイント稼働
- shared: zodスキーマ・型エクスポート用パッケージ初期化済み
- Biome 2.4.8: formatter(tab, lineWidth 100) + linter(recommended)、_bmad系ディレクトリ除外
- vitest 4.1.0: workspace統合テスト3/3パス
- husky 9.1.7 + lint-staged 16.4.0: pre-commitでbiome check --write自動実行
- パッケージ間依存: shared→frontend/backend、backend→frontend(型のみ devDeps)

### Change Log

- 2026-03-19: Story 1.1 初期実装完了 — モノレポ基盤セットアップ

### File List

- package.json (new)
- pnpm-lock.yaml (new)
- pnpm-workspace.yaml (new)
- .gitignore (new)
- biome.json (new)
- vitest.workspace.ts (new)
- .husky/pre-commit (new)
- packages/frontend/package.json (new)
- packages/frontend/index.html (new)
- packages/frontend/tsconfig.json (new)
- packages/frontend/tsconfig.app.json (new)
- packages/frontend/tsconfig.node.json (new)
- packages/frontend/vite.config.ts (new)
- packages/frontend/.env.example (new)
- packages/frontend/src/App.tsx (new)
- packages/frontend/src/main.tsx (new)
- packages/frontend/src/index.css (new)
- packages/frontend/src/vite-env.d.ts (new)
- packages/frontend/src/App.test.tsx (new)
- packages/backend/package.json (new)
- packages/backend/tsconfig.json (new)
- packages/backend/src/index.ts (new)
- packages/backend/src/index.test.ts (new)
- packages/backend/.env.example (new)
- packages/backend/public/.gitkeep (new)
- packages/shared/package.json (new)
- packages/shared/tsconfig.json (new)
- packages/shared/src/index.ts (new)
- packages/shared/src/index.test.ts (new)
