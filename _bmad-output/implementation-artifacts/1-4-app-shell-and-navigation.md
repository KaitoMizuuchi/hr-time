# Story 1.4: アプリシェルとナビゲーション

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 認証済みユーザー,
I want サイドバーナビゲーションでアプリ内を移動できる,
so that タスク画面とダッシュボード画面を切り替えて利用できる.

## Acceptance Criteria

1. **Given** 認証済みでアプリにアクセスする **When** ページが表示される **Then** 左端にサイドバーナビゲーション（アイコンベース、デフォルト閉じ56px）が表示される（FR26, UX-DR17）
2. **And** 「タスク」と「ダッシュボード」の2つのナビゲーション項目がある
3. **And** アクティブ状態は水色背景+アイコン色変更で表示される
4. **And** ホバーでツールチップが表示される
5. **Given** サイドバーの開閉トグル **When** トグルボタンをクリックする **Then** サイドバーが開（200px、アイコン+ラベル表示）と閉（56px、アイコンのみ）を切り替える
6. **Given** サイドバーで「タスク」をクリックする **When** ナビゲーションが実行される **Then** タスク画面（空のプレースホルダー）が表示される
7. **Given** サイドバーで「ダッシュボード」をクリックする **When** ナビゲーションが実行される **Then** ダッシュボード画面（空のプレースホルダー）が表示される
8. **Given** 認証済みユーザー **When** ログアウト操作を行う（サイドバー下部のログアウトボタン） **Then** セッションが破棄され、ログイン画面にリダイレクトされる（FR32）
9. **And** React Routerでルーティングが設定される（`/login`, `/signup`, `/tasks`, `/dashboard`）
10. **And** 未認証ユーザーは全保護ルートからログイン画面にリダイレクトされる（FR33）
11. **And** セマンティックHTML（header, nav, main）が使用される（UX-DR21）
12. **And** キーボード操作（Tab/Shift+Tab）でサイドバー項目間を移動できる（UX-DR21）

## Tasks / Subtasks

- [x] Task 1: shadcn/ui Sidebar + Tooltip コンポーネント追加 (AC: #1, #4)
  - [x] `pnpm dlx shadcn@latest add sidebar tooltip` でコンポーネント生成
  - [x] shadcn/uiのSidebarProvider、Sidebar、SidebarContent等を確認

- [x] Task 2: AppShellレイアウトコンポーネント作成 (AC: #1, #11)
  - [x] `components/layout/AppShell.tsx` — SidebarProvider + Sidebar + main エリア
  - [x] セマンティックHTML: `<nav>` でサイドバー、`<main>` でコンテンツ領域
  - [x] ProtectedRouteの`<Outlet>`をAppShellでラップする構造に変更

- [x] Task 3: Sidebarナビゲーション実装 (AC: #1, #2, #3, #4, #5)
  - [x] `components/layout/AppSidebar.tsx` — サイドバー本体
  - [x] デフォルト閉じ状態（56px）、開いた状態（200px）
  - [x] トグルボタンで開閉切り替え（SidebarTrigger）
  - [x] ナビゲーション項目: タスク（ClipboardList アイコン）、ダッシュボード（LayoutDashboard アイコン）
  - [x] React RouterのuseLocationでアクティブ状態判定
  - [x] アクティブ状態: 水色背景（bg-sky-100）+ アイコン色変更（text-sky-500）
  - [x] 閉じ状態時ホバーでTooltip表示（SidebarMenuButtonのtooltip prop使用）

- [x] Task 4: ログアウトボタン実装 (AC: #8)
  - [x] サイドバー下部（SidebarFooter）にログアウトボタン（LogOut アイコン）
  - [x] useAuthの`signOut`を呼び出し → セッション破棄 → `/login`にリダイレクト
  - [x] API呼び出し中はdisabled+Loader2スピナー

- [x] Task 5: ルーティング構造の調整 (AC: #6, #7, #9, #10)
  - [x] ProtectedRouteの`<Outlet>`をAppShellレイアウトでラップ
  - [x] 認証済みルート（`/tasks`, `/dashboard`）はAppShell内にレンダリング
  - [x] 認証ページ（`/login`, `/signup`）はAppShell外（現状維持）
  - [x] `/` → `/tasks` へのデフォルトリダイレクト（認証済み時）

- [x] Task 6: プレースホルダーページの空の状態更新 (AC: #6, #7)
  - [x] TasksPage: 空の状態メッセージ「タスクを追加して始めましょう」（UX-DR18）
  - [x] DashboardPage: 空の状態メッセージ「まだデータがありません。タスク画面で記録を始めましょう」（UX-DR18）

- [x] Task 7: キーボードアクセシビリティ (AC: #11, #12)
  - [x] Tab/Shift+Tabでサイドバー項目間をフォーカス移動（shadcn/ui Sidebarのbutton要素で自動対応）
  - [x] Enter/Spaceでナビゲーション実行（button要素のデフォルト動作）
  - [x] フォーカスインジケーター（ring-sidebar-ring、outline-hidden設定済み）
  - [x] `aria-label`（サイドバー、ログアウトボタン）、`aria-current="page"`（アクティブ項目）

- [x] Task 8: テスト
  - [x] AppSidebar.test.tsx — 5テスト（ナビ項目表示、ログアウト表示、タスクアクティブ、ダッシュボードアクティブ、クリック）
  - [x] AppShell.test.tsx — 4テスト（main要素、トグルボタン、タスクルート、ダッシュボードルート）
  - [x] 全既存17テスト + 新規9テスト = 全26テストパス

## Dev Notes

### アーキテクチャ準拠要件

**[Source: architecture.md#Frontend Architecture]**
```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # (new) メインレイアウト
│   │   └── AppSidebar.tsx       # (new) サイドバーナビゲーション
│   └── ui/                      # shadcn/uiコンポーネント（既存）
├── features/
│   └── auth/
│       └── hooks/
│           └── useAuth.ts       # (既存) signOut利用
├── pages/
│   ├── TasksPage.tsx            # (modify) 空の状態メッセージ更新
│   └── DashboardPage.tsx        # (modify) 空の状態メッセージ更新
├── routes/
│   ├── index.tsx                # (modify) AppShellレイアウト統合
│   └── ProtectedRoute.tsx       # (modify) AppShellラップ
├── App.tsx                      # (既存、変更なし)
└── main.tsx                     # (既存、変更なし)
```

**[Source: architecture.md#Naming Patterns]**
- `.tsx`ファイル名: PascalCase（`AppShell.tsx`, `AppSidebar.tsx`）
- フォルダ名: camelCase（`layout/`）
- コンポーネント関数: PascalCase（`export function AppShell()`）
- インポート: `@/`エイリアスを使用

### 技術スタック・バージョン

| 技術 | バージョン | 備考 |
|------|-----------|------|
| React | 19.2.4 | インストール済み |
| React Router | 7.13.1 | インストール済み |
| shadcn/ui | latest | インストール済み（Sidebar, Tooltipを追加） |
| lucide-react | 0.577.0 | インストール済み |
| Tailwind CSS | 4.2.2 | インストール済み |

### shadcn/ui Sidebarコンポーネント

shadcn/uiのSidebarは以下のサブコンポーネントで構成される:
- `SidebarProvider` — 開閉状態を管理するContextプロバイダー
- `Sidebar` — サイドバー本体コンテナ
- `SidebarHeader` / `SidebarContent` / `SidebarFooter` — 領域分割
- `SidebarMenu` / `SidebarMenuItem` / `SidebarMenuButton` — メニュー構造
- `SidebarTrigger` — 開閉トグルボタン
- `useSidebar()` — 開閉状態フック

**注意:** shadcn/uiのSidebarはデフォルトで16remの幅を使用する。UX仕様に合わせてCSS変数で調整が必要:
- 閉じ状態: `--sidebar-width-icon: 56px`（3.5rem）
- 開き状態: `--sidebar-width: 200px`（12.5rem）

### UXデザイン要件

**[Source: ux-design-specification.md#Navigation Patterns, UX-DR17]**
- アイコンベース（ラベルはホバーでツールチップ表示）
- アクティブ状態: 水色背景（bg-sky-100/sky-50）+ アイコン色変更（text-sky-500）
- 開閉式: 閉じ56px（アイコンのみ）/ 開き200px（アイコン+ラベル）
- デフォルト閉じ状態
- ホバーでツールチップ

**[Source: ux-design-specification.md#Responsive Design]**
- デスクトップレイアウト: サイドバーナビ + Todoリスト（300px固定）+ タイムライン（残り幅）
- サイドバーは左端に固定配置

**[Source: ux-design-specification.md#Design System, UX-DR1]**
- 背景: slate-50
- アクセント: sky-400〜sky-500
- Clean Minimalデザイン方向

**[Source: ux-design-specification.md#Empty States, UX-DR18]**
- Todoリスト初回: 「タスクを追加して始めましょう」
- ダッシュボード: 「まだデータがありません。タスク画面で記録を始めましょう」

**[Source: ux-design-specification.md#Accessibility, UX-DR21]**
- セマンティックHTML（header, nav, main）
- キーボード操作: Tab/Shift+Tab, Enter/Space, Esc
- フォーカスインジケーター（水色アウトライン）
- ARIA属性: aria-label, aria-expanded

### ルーティング構造の変更方針

現在の`ProtectedRoute`は単純に`<Outlet />`を返している。このストーリーでAppShellレイアウトを統合する:

```tsx
// 変更前（現在）
// routes/index.tsx
<Route element={<ProtectedRoute />}>
  <Route path="/tasks" element={<TasksPage />} />
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>

// 変更後
// ProtectedRoute → AppShell内にOutlet配置
// ProtectedRoute.tsx で認証チェック後、AppShellでラップして<Outlet />
```

**重要:** `ProtectedRoute`の認証チェックロジック（useAuth, isPending, isAuthenticated）は維持する。レイアウトの追加のみ。

### ログアウト実装

既存の`useAuth`フックに`signOut`メソッドがある。

```typescript
// features/auth/hooks/useAuth.ts（既存）
const { signOut } = useAuth()
// signOut() → セッション破棄 → /login リダイレクト
```

**注意:** signOut後のリダイレクトは`useAuth`内で処理されるか確認すること。されていない場合は`navigate("/login")`を追加。

### 前のストーリーからの学び

**Story 1.3 から:**
- shadcn/uiコンポーネント追加は`pnpm dlx shadcn@latest add <component>`で実行
- Tailwind CSS v4使用中（biome.jsonに`tailwindDirectives: true`設定済み）
- `@/`パスエイリアスがvite.config.tsで設定済み
- テストではvitest v3 + `@testing-library/react`を使用
- vitest.workspace.tsでfrontendにresolve.alias設定済み
- shadcn/uiのButton等をテストする際、getByRoleで複数マッチ注意 → より具体的なクエリ使用
- lucide-reactアイコンはインポートして直接JSXで使用
- Better Authクライアントは`lib/authClient.ts`に設定済み
- Toasterはtop-center配置、Sonner使用

**Git直近コミットから:**
- コードスタイル統一済み（biome準拠）
- vitest v3にダウングレード済み（v4は@/エイリアス非対応）
- テストファイルは同ディレクトリにコロケーション配置

### アンチパターン防止

- **禁止:** `@hr-time/backend`をruntimeでimportする（`import type`のみ許可）
- **禁止:** 相対パスの深いインポート（`@/`エイリアスを使用）
- **禁止:** shadcn/uiコンポーネントのカスタマイズ時にTailwindクラス以外を使用
- **禁止:** サイドバー幅のハードコード（CSS変数で管理）
- **禁止:** useEffectでのページ遷移（React Routerの`<Navigate>`やuseNavigateを使用）
- **禁止:** ログアウトボタンのAPI呼び出し中に二重クリック可能な状態（disabled必須）

### Project Structure Notes

- `components/layout/` ディレクトリは新規作成。共通レイアウトコンポーネントの配置場所
- `components/ui/` は shadcn/ui 生成コンポーネント用（既存）
- レイアウトコンポーネントはfeatureではなくcomponents配下（複数featureにまたがるため）
- 既存の`pages/`ディレクトリはそのまま維持（AppShellの`<main>`内にレンダリング）

### References

- [Source: architecture.md#Frontend Architecture] — ディレクトリ構造、Feature-based構成
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — 命名規則、インポートパス
- [Source: architecture.md#Process Patterns] — ローディング・エラーハンドリング
- [Source: epics.md#Story 1.4] — ストーリー定義とAC
- [Source: ux-design-specification.md#Navigation Patterns] — サイドバーナビゲーション仕様
- [Source: ux-design-specification.md#Responsive Design] — デスクトップレイアウト構成
- [Source: ux-design-specification.md#Empty States] — 空の状態パターン
- [Source: ux-design-specification.md#Accessibility Strategy] — キーボード操作、ARIA属性
- [Source: 1-3-signup-login-ui.md] — shadcn/ui設定、テスト構成、認証フック

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- shadcn/ui Sidebarのデフォルト幅（16rem/3rem）をUX仕様（200px/56px）に変更
- shadcn/uiのTooltipは@base-ui/reactベースでasChildなし → SidebarMenuButtonのtooltip propで統合
- jsdom環境でwindow.matchMediaが未定義 → テストにmockを追加
- shadcn/ui Sidebarはデスクトップ+モバイル（Sheet）両方をレンダリング → テストでgetAllByを使用

### Completion Notes List

- shadcn/ui Sidebar + Tooltip + 依存コンポーネント（separator, skeleton, sheet）追加
- AppShell: SidebarProvider + AppSidebar + SidebarInset(header+main) のレイアウト構造
- AppSidebar: タスク/ダッシュボードのナビゲーション、アクティブ状態（sky-100/sky-500）、Tooltip、ログアウトボタン
- ProtectedRoute: 認証チェック → AppShellラップに変更（Outlet削除）
- ルーティング: `/` → `/tasks` デフォルトリダイレクト追加
- TasksPage/DashboardPage: 空の状態メッセージとアイコン表示に更新
- AppSidebar.test.tsx: 5テスト、AppShell.test.tsx: 4テスト追加
- 全26テストパス、tsc --noEmit パス、biome check パス

### Change Log

- 2026-03-24: Story 1.4 実装完了 — アプリシェルとナビゲーション

### File List

- packages/frontend/src/components/ui/sidebar.tsx (new — shadcn/ui Sidebar, 幅カスタマイズ)
- packages/frontend/src/components/ui/tooltip.tsx (existing — shadcn/ui Tooltip)
- packages/frontend/src/components/ui/separator.tsx (new — shadcn/ui依存)
- packages/frontend/src/components/ui/skeleton.tsx (new — shadcn/ui依存)
- packages/frontend/src/components/ui/sheet.tsx (new — shadcn/ui依存)
- packages/frontend/src/hooks/use-mobile.ts (new — shadcn/ui依存)
- packages/frontend/src/components/ui/button.tsx (modify — shadcn更新)
- packages/frontend/src/components/ui/input.tsx (modify — shadcn更新)
- packages/frontend/src/components/layout/AppShell.tsx (new)
- packages/frontend/src/components/layout/AppShell.test.tsx (new)
- packages/frontend/src/components/layout/AppSidebar.tsx (new)
- packages/frontend/src/components/layout/AppSidebar.test.tsx (new)
- packages/frontend/src/pages/TasksPage.tsx (modify — 空の状態メッセージ更新)
- packages/frontend/src/pages/DashboardPage.tsx (modify — 空の状態メッセージ+ナビゲーション)
- packages/frontend/src/routes/ProtectedRoute.tsx (modify — AppShellラップ)
- packages/frontend/src/routes/index.tsx (modify — `/` → `/tasks` リダイレクト追加)
