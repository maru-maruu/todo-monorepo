import { Platform } from 'react-native';

import { authClient } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8788';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  let credentials: RequestCredentials = 'include';
  const cookies = await authClient.getCookie();
  if (cookies) {
    headers.Cookie = cookies;
    credentials = 'omit';
  } else if (Platform.OS === 'web') {
    credentials = 'include';
  }

  const response = await fetch(url, {
    ...options,
    credentials,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
      else if (body?.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export { API_URL };
