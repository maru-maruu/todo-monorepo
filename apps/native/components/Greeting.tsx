import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { getFirstName } from '@/lib/utils';
import { useSession } from '@/lib/auth';

export function Greeting() {
  const { data: session } = useSession();
  const firstName = getFirstName(session?.user?.name);

  return (
    <Text style={styles.greeting}>RISE & SHINE, {firstName.toUpperCase()} ✨</Text>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontFamily: fonts.inter,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: 4,
  },
});
