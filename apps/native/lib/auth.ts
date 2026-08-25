import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';

import { secureStorage } from './secure-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8787';

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
