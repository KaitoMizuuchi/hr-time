# Story 2.1: プロジェクトCRUDバックエンド＆フロントエンド

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a ユーザー,
I want プロジェクトを作成・編集・削除できる,
so that 案件ごとにタスクを整理できる.

## Acceptance Criteria

1. **Given** 認証済みユーザー **When** タスク画面を開く **Then** 2カラムレイアウトの左カラムにTodoリスト領域が表示される（FR27）
2. **And** Todoリスト上部に「+」ボタン（タスク追加）がある
3. **Given** タスク追加モーダルを開く **When** プロジェクト選択欄でSelectCreateコンポーネントを使用する（UX-DR8） **Then** 既存プロジェクトの一覧がドロップダウンで表示される
4. **And** テキスト入力で既存プロジェクトをフィルタリングできる
5. **And** 一致するプロジェクトがない場合「"入力値" を作成」オプションが表示される
6. **And** 新規作成を選択するとプロジェクトが即座に作成される
7. **Given** 作成済みのプロジェクト **When** プロジェクト名を編集する **Then** プロジェクト名が更新される
8. **Given** タスクが紐づいていないプロジェクト **When** プロジェクトを削除する **Then** プロジェクトが削除され、Todoリストから消える
9. **And** Success Toastが表示される（3秒自動消去、UX-DR16）
10. **Given** タスクが紐づいているプロジェクト **When** プロジェクトを削除しようとする **Then** 配下タスクの扱いについて確認が求められる
11. **And** バックエンドにProjectテーブル（Prisma）、`/api/projects/*`ルート、service、repositoryが実装される
12. **And** sharedにプロジェクト用zodスキーマが定義される
13. **And** プロジェクトにはカラー属性（パステルカラーパレットから選択）が含まれる（UX-DR2）

## Tasks / Subtasks

- [x] Task 1: Prisma Projectモデル追加＆マイグレーション (AC: #11, #13)
  - [x] `schema.prisma`にProjectモデル追加（id, name, color, userId, createdAt, updatedAt）
  - [x] Userとのリレーション設定（User hasMany Project）
  - [x] `prisma migrate dev`でマイグレーション実行
  - [x] パステルカラーパレット定数を`packages/shared`に定義

- [x] Task 2: shared zodスキーマ定義 (AC: #12)
  - [x] `packages/shared/src/schemas/project.ts`にcreateProjectSchema、updateProjectSchemaを定義
  - [x] カラー値のバリデーション（パレット内の値のみ許可）
  - [x] 型エクスポート（CreateProjectInput, UpdateProjectInput, Project型）
  - [x] `packages/shared/src/index.ts`にエクスポート追加

- [x] Task 3: バックエンドrepository層 (AC: #11)
  - [x] `packages/backend/src/repositories/project.repository.ts`作成
  - [x] CRUD操作: findAllByUserId, findById, create, update, delete
  - [x] タスク紐づき確認用: hasRelatedTasks — Story 2.2でTaskモデル追加後に実装予定

- [x] Task 4: バックエンドservice層 (AC: #11)
  - [x] `packages/backend/src/services/project.service.ts`作成
  - [x] ビジネスロジック: 作成、更新、削除（所有権チェック付き）
  - [x] 削除時: タスク紐づきチェックはStory 2.2で追加予定（PROJECT_HAS_TASKSエラーコード準備済み）

- [x] Task 5: バックエンドAPIルート (AC: #11)
  - [x] `packages/backend/src/routes/project.routes.ts`作成
  - [x] `GET /api/projects` — 認証ユーザーのプロジェクト一覧
  - [x] `POST /api/projects` — プロジェクト作成（zodバリデーション）
  - [x] `PATCH /api/projects/:id` — プロジェクト更新
  - [x] `DELETE /api/projects/:id` — プロジェクト削除
  - [x] `index.ts`にルート登録

- [x] Task 6: フロントエンドAPI呼び出し＆hooks (AC: #3-#10)
  - [x] `packages/frontend/src/features/projects/api.ts` — Hono RPCクライアント呼び出し
  - [x] `packages/frontend/src/features/projects/hooks/useProjects.ts` — TanStack Query hooks（useQuery, useMutation）
  - [x] invalidateQueriesでDB確定後リフレッシュ

- [x] Task 7: 2カラムレイアウト＆Todoリスト領域 (AC: #1, #2)
  - [x] TasksPageを2カラムレイアウト（左: Todoリスト300px固定、右: タイムラインプレースホルダー）に変更
  - [x] 左カラム上部に「+」ボタン配置
  - [x] Todoリストを高さ固定のスクロールコンテナで実装
  - [x] Todoリスト空の場合「タスクを追加して始めましょう」メッセージ表示（UX-DR18）

- [x] Task 8: SelectCreateコンポーネント (AC: #3, #4, #5, #6)
  - [x] `packages/frontend/src/components/ui/SelectCreate.tsx`作成
  - [x] 入力フィールド（検索/フィルタ兼用）
  - [x] 既存項目のドロップダウンリスト
  - [x] フィルタリング機能
  - [x] 一致なし時「"入力値" を作成」オプション表示
  - [x] 選択/新規作成のコールバック

- [x] Task 9: タスク追加モーダル（プロジェクト部分のみ） (AC: #3-#6)
  - [x] `packages/frontend/src/features/tasks/components/TaskAddModal.tsx`作成
  - [x] タスク名入力フィールド
  - [x] SelectCreateでプロジェクト選択/新規作成
  - [x] 新規プロジェクト作成時: APIでプロジェクト作成→選択状態にセット
  - [x] **Note:** タスクのAPI保存はStory 2.2で実装。このストーリーではモーダルUIとプロジェクト作成のみ

- [x] Task 10: プロジェクト編集・削除UI (AC: #7, #8, #9, #10)
  - [x] プロジェクトグループヘッダーにコンテキストメニュー（編集、削除）
  - [x] 編集: Dialogモーダルでプロジェクト名変更
  - [x] 削除: 確認ダイアログ+Success Toast
  - [x] 削除: タスク紐づき確認はStory 2.2で統合テスト

- [x] Task 11: テスト
  - [x] project.service.test.ts — 10テスト（getAll, getById, create, update, delete のビジネスロジック）
  - [x] SelectCreate.test.tsx — 3テスト（プレースホルダー、選択済み表示、ドロップダウン展開）
  - [x] 全39テストパス（既存26 + 新規13）、tsc --noEmitパス

## Dev Notes

### アーキテクチャ準拠要件

**バックエンドレイヤー構成:** [Source: architecture.md#Backend Architecture]
```
routes/project.routes.ts → services/project.service.ts → repositories/project.repository.ts → Prisma → DB
```
- routes: リクエスト受付、zodバリデーション、レスポンス返却
- services: ビジネスロジック（削除時のタスク紐づきチェック）
- repositories: 純粋なDB操作

**APIレスポンス統一フォーマット:** [Source: architecture.md#API & Communication Patterns]
```json
// 成功時
{ "success": true, "data": { ... } }
// エラー時
{ "success": false, "error": { "code": "PROJECT_HAS_TASKS", "message": "..." } }
```

**Hono RPC型共有:** [Source: architecture.md#Frontend Architecture]
- ルート定義から型が自動伝播。frontendの`devDependencies`に`@hr-time/backend: "workspace:*"`
- `import type`のみ。ランタイム依存なし

**フロントエンドFeature-based構造:** [Source: architecture.md#Frontend Architecture]
```
frontend/src/
├── features/
│   └── projects/          # (new) プロジェクト機能
│       ├── components/    # ProjectGroup等
│       ├── hooks/         # useProjects.ts
│       └── api.ts         # Hono RPC呼び出し
├── features/
│   └── tasks/             # (new, partial) タスク追加モーダル
│       ├── components/    # TaskAddModal.tsx
│       └── hooks/
├── components/
│   └── ui/
│       └── SelectCreate.tsx  # (new) 共通コンポーネント
└── pages/
    └── TasksPage.tsx      # (modify) 2カラムレイアウト
```

### Prisma Projectモデル設計

```prisma
model Project {
  id        String   @id @default(uuid())
  name      String
  color     String   // パステルカラーコード
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks     Task[]   // Story 2.2でTaskモデル追加時にリレーション確立
}
```

**Note:** Taskモデルは未定義（Story 2.2で追加）。Projectモデルのtasksリレーションは2.2実装時に追加すること。このストーリーではProjectモデルのみ作成し、tasksリレーションフィールドは含めない。

### パステルカラーパレット

[Source: ux-design-specification.md#Color System]
プロジェクト別色分け用パステル系カラーを`packages/shared/src/constants/colors.ts`に定義:
```typescript
export const PROJECT_COLORS = [
  '#93C5FD', // blue-300
  '#86EFAC', // green-300
  '#FCA5A5', // red-300
  '#FCD34D', // amber-300
  '#C4B5FD', // violet-300
  '#67E8F9', // cyan-300
  '#FDBA74', // orange-300
  '#F0ABFC', // fuchsia-300
  '#6EE7B7', // emerald-300
  '#FDA4AF', // rose-300
] as const
```
- テキスト可読性確保のため淡いトーン（300系）を使用
- 新規プロジェクト作成時はパレットから順番（または未使用色）を自動割り当て
- ユーザーによるカラー選択UIは将来拡張（MVPでは自動割り当て）

### エラーコード追加

[Source: architecture.md#API & Communication Patterns, shared/src/errors/codes.ts]
```typescript
// packages/shared/src/errors/codes.ts に追加
export const ERROR_CODES = {
  // 既存
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  // 追加
  PROJECT_HAS_TASKS: 'PROJECT_HAS_TASKS',
} as const
```

### SelectCreateコンポーネント仕様

[Source: ux-design-specification.md#Custom Components - SelectCreate]
- **States:** 未選択、フォーカス中（リスト展開）、選択済み、新規作成モード
- **Interaction:** 入力開始でフィルタリング、クリックで選択、一致なしで新規作成を提示
- shadcn/uiの`Popover` + `Command`（cmdk）パターンで実装推奨
  - `pnpm dlx shadcn@latest add popover command`
- プロジェクト以外にも再利用可能な汎用コンポーネントとして設計（Story 2.3のタグ選択でも使用）

### 2カラムレイアウト仕様

[Source: ux-design-specification.md#Spacing & Layout Foundation]
- 左カラム: Todoリスト（300px固定幅）
- 右カラム: タイムライン（残り幅、flex-1）— このストーリーではプレースホルダー
- サイドバー（56px/200px）の右側に配置
- Todoリストは高さ固定のスクロールコンテナ（`overflow-y: auto`, `h-full`相当）

### Toast仕様

[Source: ux-design-specification.md#Feedback Patterns]
- Success Toast: 3秒自動消去
- Error Toast: ユーザーが閉じるまで表示
- Sonner（既にインストール済み、top-center配置）を使用

### DB確定後リフレッシュ方式

[Source: architecture.md#Cross-Cutting Concerns]
- 楽観的更新は不採用。API呼び出し中はpending状態をUIに表示
- 確定後に`queryClient.invalidateQueries({ queryKey: ['projects'] })`でリフレッシュ
- API呼び出し中はボタンをdisabled + Loader2スピナーで二重送信防止

### 技術スタック・バージョン

| 技術 | バージョン | 備考 |
|------|-----------|------|
| Hono | 4.12.7 | Hono RPCでの型安全API |
| Prisma | 7.x | PostgreSQL adapter使用 |
| TanStack Query | 5.90.x | DB確定後リフレッシュ方式 |
| React | 19.x | インストール済み |
| shadcn/ui | latest | Popover, Command追加が必要 |
| lucide-react | 0.577.0 | アイコン |
| vitest | v3 | テストフレームワーク（v4は@/エイリアス非対応） |
| Sonner | installed | Toast通知 |

### 命名規則

[Source: architecture.md#Naming Patterns]
- Prismaモデル: PascalCase（`Project`）
- APIエンドポイント: kebab-case複数形（`/api/projects`）
- .tsファイル: camelCase（`project.service.ts`, `project.repository.ts`）
- .tsxファイル: PascalCase（`SelectCreate.tsx`, `TaskAddModal.tsx`）
- フォルダ: camelCase（`features/projects/`）
- テスト配置: コロケーション（同ディレクトリに`.test.ts`）
- インポート: `@/`エイリアス使用

### 前のストーリーからの学び

**Story 1.4 から:**
- shadcn/uiコンポーネント追加は`pnpm dlx shadcn@latest add <component>`
- Tailwind CSS v4使用中
- `@/`パスエイリアスがvite.config.tsで設定済み
- vitest v3 + `@testing-library/react`でテスト
- テストでwindow.matchMediaモック必要な場合あり
- shadcn/uiのSidebarはデスクトップ+モバイル両方レンダリング → テストでgetAllBy使用
- AppShellレイアウト（SidebarProvider + Sidebar + SidebarInset）が既に構築済み
- ProtectedRouteで認証チェック → AppShellラップの構造が確立済み

**Git直近コミットから:**
- コードスタイル: Biome準拠
- vitest v3にダウングレード済み
- テストファイルは同ディレクトリにコロケーション配置

### アンチパターン防止

- **禁止:** `@hr-time/backend`をruntimeでimport（`import type`のみ許可）
- **禁止:** 相対パスの深いインポート（`@/`エイリアスを使用）
- **禁止:** 楽観的更新の使用（DB確定後リフレッシュ方式を遵守）
- **禁止:** TaskモデルをこのストーリーでPrismaに追加する（Story 2.2の担当）
- **禁止:** プロジェクト削除時にタスクを無断で削除する（確認UIが必須）
- **禁止:** useEffectでのデータフェッチ（TanStack Queryを使用）
- **禁止:** APIレスポンスで`undefined`使用（`null`を使用）

### Project Structure Notes

- `features/projects/`は新規ディレクトリ。プロジェクトCRUDのフロントエンド機能を集約
- `features/tasks/`は新規ディレクトリ。タスク追加モーダルのUIのみ（API保存はStory 2.2）
- `components/ui/SelectCreate.tsx`は共通コンポーネント。projects, tagsの両方で再利用
- `repositories/`、`services/`はバックエンドの新規ディレクトリ（Epic 1では未使用だったroutes以外のレイヤー）
- `routes/project.routes.ts`を`index.ts`にチェーンして登録

### References

- [Source: epics.md#Story 2.1] — ストーリー定義とAC
- [Source: architecture.md#Backend Architecture] — レイヤー構成（routes→services→repositories）
- [Source: architecture.md#API & Communication Patterns] — APIルーティング規約、レスポンスフォーマット
- [Source: architecture.md#Frontend Architecture] — Feature-basedディレクトリ、Hono RPC型共有
- [Source: architecture.md#Data Architecture] — Prisma、zodバリデーション共有
- [Source: architecture.md#Naming Patterns] — 命名規則
- [Source: architecture.md#Test Strategy] — テストピラミッド、vitestパターン
- [Source: ux-design-specification.md#SelectCreate] — セレクト/クリエイトコンポーネント仕様
- [Source: ux-design-specification.md#Spacing & Layout Foundation] — 2カラムレイアウト
- [Source: ux-design-specification.md#Feedback Patterns] — Toast仕様
- [Source: ux-design-specification.md#Color System] — パステルカラーパレット
- [Source: ux-design-specification.md#Modal & Popover Patterns] — タスク追加モーダル仕様
- [Source: 1-4-app-shell-and-navigation.md] — 前ストーリーの構造とパターン

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Prisma 7.x: `update`/`delete`のwhereは一意フィールド(id)のみ対応 → repositoryで所有権チェックをserviceに委譲
- shadcn/ui v2はbase-ui/react使用 — `asChild`不要、Dialog/Popoverの`onOpenChange`シグネチャが異なる
- cmdk CommandがjsdomでResizeObserver, scrollIntoViewを要求 → テストにmock追加
- base-uiのPopoverはportalでコンテンツを複製レンダリング → テストで`getAllBy`使用
- shadcn/ui dialog追加時にreact-remove-scrollがtslibを要求 → ルートにtslib追加

### Completion Notes List

- Prisma Projectモデル追加（マイグレーション完了）、Userリレーション設定
- shared: パステルカラーパレット10色定義、zodスキーマ（create/update）、PROJECT_HAS_TASKSエラーコード追加
- バックエンド: routes→services→repositories 3層アーキテクチャで/api/projects/* CRUD実装
- AppEnv型を定義してHonoコンテキストの型安全性を確保
- フロントエンド: features/projects/（api, hooks, components）でプロジェクトCRUD UI
- 2カラムレイアウト（左Todoリスト300px、右タイムラインプレースホルダー）
- SelectCreateコンポーネント（Popover+Command パターン、汎用再利用可能）
- タスク追加モーダル（プロジェクト選択/新規作成のみ、タスク保存はStory 2.2）
- プロジェクト編集Dialog、削除確認Dialog
- テスト: project.service.test.ts(10テスト)、SelectCreate.test.tsx(3テスト)
- 全39テストパス、tsc --noEmitパス、biome checkパス（shadcn自動生成以外）

### Change Log

- 2026-03-24: Story 2.1 実装完了 — プロジェクトCRUDバックエンド＆フロントエンド

### File List

- packages/backend/prisma/schema.prisma (modify — Projectモデル追加、Userリレーション追加)
- packages/backend/prisma/migrations/20260324050527_add_project_model/ (new — マイグレーション)
- packages/backend/src/generated/prisma/ (regenerated — Prismaクライアント)
- packages/backend/src/types/env.ts (new — Hono AppEnv型定義)
- packages/backend/src/repositories/project.repository.ts (new — DB操作層)
- packages/backend/src/services/project.service.ts (new — ビジネスロジック層)
- packages/backend/src/services/project.service.test.ts (new — 10テスト)
- packages/backend/src/routes/project.routes.ts (new — APIルート)
- packages/backend/src/index.ts (modify — projectRoutes登録)
- packages/shared/src/constants/colors.ts (new — パステルカラーパレット)
- packages/shared/src/schemas/project.ts (new — zodスキーマ)
- packages/shared/src/errors/codes.ts (modify — PROJECT_HAS_TASKSコード追加)
- packages/shared/src/index.ts (modify — エクスポート追加)
- packages/frontend/src/pages/TasksPage.tsx (modify — 2カラムレイアウト)
- packages/frontend/src/components/ui/SelectCreate.tsx (new — セレクト/クリエイトコンポーネント)
- packages/frontend/src/components/ui/SelectCreate.test.tsx (new — 3テスト)
- packages/frontend/src/components/ui/dialog.tsx (new — shadcn/ui Dialog)
- packages/frontend/src/components/ui/command.tsx (new — shadcn/ui Command)
- packages/frontend/src/components/ui/textarea.tsx (new — shadcn/ui依存)
- packages/frontend/src/components/ui/input-group.tsx (new — shadcn/ui依存)
- packages/frontend/src/features/projects/api.ts (new — Hono RPCクライアント)
- packages/frontend/src/features/projects/hooks/useProjects.ts (new — TanStack Query hooks)
- packages/frontend/src/features/projects/components/ProjectList.tsx (new — プロジェクト一覧)
- packages/frontend/src/features/projects/components/ProjectGroup.tsx (new — プロジェクトグループ)
- packages/frontend/src/features/projects/components/ProjectEditDialog.tsx (new — 編集ダイアログ)
- packages/frontend/src/features/projects/components/ProjectDeleteDialog.tsx (new — 削除ダイアログ)
- packages/frontend/src/features/tasks/components/TaskAddModal.tsx (new — タスク追加モーダル)
- package.json (modify — tslib追加)
- packages/frontend/package.json (modify — tslib追加)
