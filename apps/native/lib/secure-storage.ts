import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

function safeKey(key: string): string {
  return key.replace(/:/g, '_');
}

const webStorage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(safeKey(key));
    } catch {
      return null;
    }
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(safeKey(key), value);
    } catch {
      // ignore quota / SSR errors
    }
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(safeKey(key));
    } catch {
      // ignore
    }
  },
};

const nativeStorage = {
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

const platformStorage = Platform.OS === 'web' ? webStorage : nativeStorage;

/**
 * SecureStore rejects keys containing colons — normalize before read/write.
 * Web uses localStorage so Expo web preview can persist auth sessions.
 */
const secureStorage = {
  getItem: (_key: string): string | null => null,
  setItem: (_key: string, _value: string): void => {},
  getItemAsync: platformStorage.getItemAsync,
  setItemAsync: platformStorage.setItemAsync,
  deleteItemAsync: platformStorage.deleteItemAsync,
};

export { secureStorage };
