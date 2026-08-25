# Todo App — Native (Expo)

Warm cream mobile todo app built with Expo Router, TanStack Query, and better-auth.

## Prerequisites

- Node.js 20+
- pnpm (from monorepo root)
- For Android: Android SDK / emulator (see below)

## Environment

Copy `.env.example` to `.env` and set the API URL:

```bash
cp .env.example .env
```

| Variable | Default | Notes |
|----------|---------|-------|
| `EXPO_PUBLIC_API_URL` | `http://127.0.0.1:8788` | Backend base URL (no trailing slash) |

**Android emulator:** use `http://10.0.2.2:8788` instead of `127.0.0.1`.

## Install

From the monorepo root:

```bash
pnpm install
```

## Run (development)

From the monorepo root or this directory:

```bash
cd apps/native
pnpm start -- --port 8089
```

Metro default in this repo: **http://localhost:8089** (web preview: same URL in browser).

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

## Run on Android (native build)

Requires Android Studio with SDK, emulator, and platform tools installed (see root README).

```bash
cd apps/native
npx expo prebuild --platform android   # first time only
pnpm android
# or: npx expo run:android
```

Set `EXPO_PUBLIC_API_URL=http://10.0.2.2:8788` in `.env` for the Android emulator.

## Typecheck

```bash
pnpm typecheck
```

## App scheme

Deep link / OAuth scheme: `todoapp` (configured in `app.json`).

## Screens

- **Auth:** Sign in, Sign up (email + password)
- **Tasks:** Today's tasks, swipe-to-delete, add task sheet
- **Daily:** Daily routines with schedule pills and toggles
- **Settings:** Profile, notifications, reminder time, theme, accent, export, clear completed
