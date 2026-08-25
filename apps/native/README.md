# Todo App — Native (Expo)

Warm cream mobile todo app built with Expo Router, TanStack Query, and better-auth.

## Prerequisites

- Node.js 20+
- pnpm (from monorepo root)
- For Android: Android SDK / emulator (see `expo run:android` below)

## Environment

Copy `.env.example` to `.env` and set the API URL:

```bash
cp .env.example .env
```

| Variable | Default | Notes |
|----------|---------|-------|
| `EXPO_PUBLIC_API_URL` | `http://127.0.0.1:8787` | Backend base URL (no trailing slash) |

**Android emulator:** use `http://10.0.2.2:<port>` instead of `127.0.0.1` (e.g. `http://10.0.2.2:8787` or `8788` if the server uses that port).

## Install

From the monorepo root:

```bash
pnpm install
```

## Run (development)

From the monorepo root or this directory:

```bash
cd apps/native
pnpm start
```

Or with a custom Metro port:

```bash
pnpm start -- --port 8089
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

## Run on Android (native build)

Generates `android/` via prebuild if needed, then builds and runs on a connected device or emulator:

```bash
cd apps/native
npx expo prebuild --platform android   # first time only
pnpm android
# or: npx expo run:android
```

Ensure `EXPO_PUBLIC_API_URL` points to `http://10.0.2.2:<port>` for the Android emulator.

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
