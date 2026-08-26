# Todo App Monorepo

Expo（React Native）クライアントと Cloudflare Workers API サーバーで構成される Todo アプリの Turborepo モノレポです。

## リポジトリ構成

```
.
├── apps/
│   ├── native/          # Expo モバイルアプリ
│   └── server/          # Hono + Cloudflare Workers API
├── packages/
│   └── db/              # Drizzle スキーマ・型・マイグレーション
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 前提条件

- Node.js 20+
- pnpm 9+
- Cloudflare Wrangler（`pnpm install` で導入されます）

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. サーバー環境変数

```bash
cp apps/server/.dev.vars.example apps/server/.dev.vars
```

`apps/server/.dev.vars` の内容:

```
BETTER_AUTH_SECRET=dev-secret-change-me-in-production
BETTER_AUTH_URL=http://127.0.0.1:8788
```

### 3. ローカル D1 マイグレーション

```bash
pnpm db:migrate:local
```

スキーマ変更時は以下を実行します:

```bash
pnpm db:generate
pnpm db:migrate:local
```

### 4. API サーバー起動

```bash
pnpm dev:server
# または
pnpm --filter server dev
```

デフォルト URL: **http://127.0.0.1:8788**

ヘルスチェック:

```bash
curl http://127.0.0.1:8788/api/health
```

### 5. Expo（ネイティブアプリ）起動

```bash
pnpm --filter native start -- --port 8089
```

Metro / Web プレビュー: **http://localhost:8089**

本番向け Release APK は `pnpm native:build:android`（手順: [`docs/log_2026-08-25_1349_android-local-build-notes.md`](docs/log_2026-08-25_1349_android-local-build-notes.md)）。

実機 / エミュレータ:

```bash
pnpm --filter native exec expo run:android
pnpm --filter native exec expo run:ios
```

#### Android エミュレータから API へ接続

ホストマシンの localhost には直接アクセスできません。代わりに:

```
http://10.0.2.2:8788
```

`apps/native/.env` に `EXPO_PUBLIC_API_URL=http://10.0.2.2:8788` を設定してください。

iOS シミュレータは `http://127.0.0.1:8788` をそのまま利用できます。

#### Android エミュレータのセットアップ（Android Studio）

このリポジトリの Cloud Agent VM では SDK 未導入の場合があります。ローカルでは次の手順で準備します:

1. [Android Studio](https://developer.android.com/studio) をインストール
2. **SDK Manager** → **SDK Platforms** で **Android 14 (API 34)** をインストール
3. **SDK Manager** → **SDK Tools** で **Android SDK Command-line Tools**、**Android Emulator**、**Android SDK Platform-Tools** を有効化
4. **Device Manager** で **Create Virtual Device** → API 34 x86_64 イメージのエミュレータを作成
5. 環境変数（例）:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
```

6. エミュレータ起動後:

```bash
cd apps/native
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://10.0.2.2:8788 に編集
pnpm android
```

## API 概要

ベース URL: `http://127.0.0.1:8788`

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | `/api/health` | 不要 | ヘルスチェック |
| GET/POST | `/api/auth/*` | 不要 | Better Auth（サインアップ / サインイン等） |
| GET/POST | `/api/tasks` | 必要 | タスク一覧 / 作成 |
| PATCH/DELETE | `/api/tasks/:id` | 必要 | タスク更新 / 削除 |
| GET/PATCH | `/api/settings` | 必要 | ユーザー設定 |
| POST | `/api/settings/clear-completed` | 必要 | 完了済みタスク一括削除 |
| GET | `/api/settings/export` | 必要 | タスク JSON エクスポート |

### 認証

メール / パスワード認証（メール確認なし）。Expo 向け `@better-auth/expo` プラグイン有効。

`trustedOrigins`: `todoapp://`, `exp://`, `http://localhost:*`

### サンプル curl（Cookie セッション）

```bash
# サインアップ
curl -c cookies.txt -b cookies.txt \
  -X POST http://127.0.0.1:8788/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123","name":"User"}'

# タスク作成
curl -c cookies.txt -b cookies.txt \
  -X POST http://127.0.0.1:8788/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"name":"Buy milk","dueDate":"2026-08-25","accent":"green"}'

# タスク一覧
curl -c cookies.txt -b cookies.txt http://127.0.0.1:8788/api/tasks
```

## データモデル（`packages/db`）

### 型のインポート

- サーバー: `@todo/db`
- ネイティブ（型のみ）: `@todo/db/types`
- 繰り返しヘルパー: `@todo/db/repeat`

### `tasks`

通常タスクと繰り返しタスクを 1 テーブルで扱います。

| 列 | 説明 |
|----|------|
| `name` | タスク名（必須） |
| `notes` | メモ（nullable） |
| `icon` | アイコン（default `users`） |
| `accent` | `pink` \| `brown` \| `green` |
| `startDate` / `dueDate` | `YYYY-MM-DD`（nullable） |
| `dueTime` | `HH:mm`（nullable） |
| `repeatType` | `daily` \| `weekly` \| `monthly` \| `yearly` \| null |
| `repeatWeekdays` | weekly のみ。`0`=月 … `6`=日 の JSON 配列 |
| `completedAt` | 完了日時（未完了は null） |
| `createdAt` / `lastModifiedAt` | タイムスタンプ |

### `tasks.accent`

`pink` | `brown` | `green`

## スクリプト

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 全パッケージ dev（Turbo） |
| `pnpm dev:server` | API サーバーのみ |
| `pnpm db:generate` | Drizzle マイグレーション生成 |
| `pnpm db:migrate:local` | ローカル D1 にマイグレーション適用 |
| `pnpm --filter server db:migrate:remote` | リモート（本番）D1 にマイグレーション適用 |
| `pnpm --filter server run deploy` | Worker を Cloudflare にデプロイ |
| `pnpm typecheck` | TypeScript 型チェック |

## 本番デプロイ（Workers + D1）

作業ディレクトリは `apps/server`。詳細な実行記録は [`docs/log_2026-08-25_1308_workers-production-deploy.md`](docs/log_2026-08-25_1308_workers-production-deploy.md)。

### 前提

- `pnpm exec wrangler whoami` でログイン済みであること
- `apps/server/wrangler.jsonc` の `database_id` は **`wrangler d1 create` / `d1 list` / `d1 info` の出力 UUID**（捏造しない）
- `compatibility_date` はデプロイ作業当日の日付
- `BETTER_AUTH_SECRET` は `wrangler.jsonc` に書かない（`wrangler secret put`）
- `.dev.vars` のローカル値を本番シークレットに流用しない

### 手順

1. D1 が無ければ作成し、返ってきた UUID を `wrangler.jsonc` の `database_id` に書く（binding 名はコードどおり `DB`）:

```bash
cd apps/server
pnpm exec wrangler d1 create todo-db
```

2. 本番 D1 にマイグレーション適用:

```bash
pnpm db:migrate:remote
# または: pnpm exec wrangler d1 migrations apply todo-db --remote
```

3. シークレット設定（対話プロンプト。値を echo で渡さない）:

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
```

4. 設定検証（デプロイしない）:

```bash
pnpm exec wrangler deploy --dry-run
```

5. デプロイ:

```bash
pnpm --filter server run deploy
```

6. 出力された `https://todo-server.<SUBDOMAIN>.workers.dev` を `wrangler.jsonc` の `vars.BETTER_AUTH_URL` に書き、必要なら再デプロイ。

7. ヘルスチェック:

```bash
curl https://todo-server.<SUBDOMAIN>.workers.dev/api/health
```

Native クライアントは `EXPO_PUBLIC_API_URL` を同じ本番 URL に合わせ、ビルドし直す。
## 技術スタック

- **Monorepo**: pnpm + Turborepo
- **API**: Hono on Cloudflare Workers
- **DB**: Cloudflare D1 + Drizzle ORM
- **Auth**: better-auth（email/password, Expo プラグイン）
- **Mobile**: Expo / React Native
