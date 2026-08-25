import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accentRose} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontFamily: fonts.inter,
    fontSize: 14,
    color: colors.textMuted,
  },
});
