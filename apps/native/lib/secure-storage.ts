import * as SecureStore from 'expo-secure-store';

function safeKey(key: string): string {
  return key.replace(/:/g, '_');
}

/**
 * SecureStore rejects keys containing colons — normalize before read/write.
 * Implements both sync-style and async SecureStore APIs for better-auth expo client.
 */
const secureStorage = {
  getItem: (key: string): string | null => {
    // SecureStore is async-only; better-auth may call sync API — return null and rely on async
    return null;
  },
  setItem: (_key: string, _value: string): void => {
    // no-op sync fallback
  },
  getItemAsync: async (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(safeKey(key));
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(safeKey(key), value);
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(safeKey(key));
  },
};

export { secureStorage };
