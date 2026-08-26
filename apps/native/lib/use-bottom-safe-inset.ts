import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ANDROID_NAVIGATION_BAR_INSET } from '@/constants/android-insets';

/**
 * 画面下部の safe area inset を返す。
 * Android では insets.bottom が 0 のときナビゲーションバー用定数を使う。
 */
export function useBottomSafeInset(): number {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'android') {
    return insets.bottom > 0 ? insets.bottom : ANDROID_NAVIGATION_BAR_INSET;
  }

  return insets.bottom;
}
