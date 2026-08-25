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
| GET/POST | `/api/daily-tasks` | 必要 | デイリータスク一覧 / 作成 |
| PATCH/DELETE | `/api/daily-tasks/:id` | 必要 | デイリータスク更新 / 削除 |
| GET/PATCH | `/api/settings` | 必要 | ユーザー設定 |
| POST | `/api/settings/clear-completed` | 必要 | 完了済みタスク一括削除 |
| GET | `/api/settings/export` | 必要 | タスク・デイリータスク JSON エクスポート |

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
  -d '{"title":"Buy milk","dueDate":"2026-08-25","accent":"green"}'

# タスク一覧
curl -c cookies.txt -b cookies.txt http://127.0.0.1:8788/api/tasks
```

## データモデル（`packages/db`）

### 型のインポート

- サーバー: `@todo/db`
- ネイティブ（型のみ）: `@todo/db/types`

### `daily_tasks.days`

曜日は **JSON 数値配列** で保存します。

- `0` = 月曜 … `6` = 日曜

例: `[0, 2, 4]` → 月・水・金

### `tasks.accent`

`pink` | `brown` | `green`

## スクリプト

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 全パッケージ dev（Turbo） |
| `pnpm dev:server` | API サーバーのみ |
| `pnpm db:generate` | Drizzle マイグレーション生成 |
| `pnpm db:migrate:local` | ローカル D1 にマイグレーション適用 |
| `pnpm typecheck` | TypeScript 型チェック |

## 本番デプロイ

1. D1 データベース作成:

```bash
cd apps/server
wrangler d1 create todo-db
```

2. `apps/server/wrangler.jsonc` の `database_id` を出力された UUID に更新

3. リモートマイグレーション:

```bash
pnpm db:generate
cd apps/server
wrangler d1 migrations apply todo-db --remote
```

4. シークレット設定:

```bash
wrangler secret put BETTER_AUTH_SECRET
```

5. デプロイ:

```bash
wrangler deploy
```

`BETTER_AUTH_URL` はデプロイ後の Workers URL に合わせて設定してください。

## 技術スタック

- **Monorepo**: pnpm + Turborepo
- **API**: Hono on Cloudflare Workers
- **DB**: Cloudflare D1 + Drizzle ORM
- **Auth**: better-auth（email/password, Expo プラグイン）
- **Mobile**: Expo / React Native
