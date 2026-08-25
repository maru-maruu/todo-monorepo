import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';

import { secureStorage } from './secure-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8788';

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: 'todoapp',
      storagePrefix: 'todoapp',
      storage: secureStorage,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

/**
 * better-auth / better-fetch のエラーオブジェクトから表示用メッセージを取り出す。
 *
 * 公式の Result 型は `{ data, error: { message?, code?, status, statusText } }`。
 * ただし非 JSON 応答や `{ error: string }` 形状では `message` が欠けることがあるため、
 * message → error → code → statusText の順でフォールバックする。
 */
export type AuthClientError = {
  message?: string | null;
  code?: string | null;
  status?: number;
  statusText?: string | null;
  error?: string | null;
} | null;

export function getAuthErrorMessage(
  error: AuthClientError,
  fallback: string,
): string {
  if (!error) return fallback;

  const candidates = [
    error.message,
    typeof error.error === 'string' ? error.error : null,
    error.code,
    error.statusText,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return fallback;
}
