import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus, PlusCircle } from 'lucide-react-native';

import { colors, fonts, radius } from '@/constants/theme';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'tasks' | 'daily';
  icon?: 'plus' | 'plus-circle';
}

export function PillButton({
  label,
  onPress,
  variant = 'tasks',
  icon = 'plus',
}: PillButtonProps) {
  const bgColor = variant === 'tasks' ? colors.fabTasks : colors.fabDaily;
  const IconComponent = icon === 'plus-circle' ? PlusCircle : Plus;

  return (
    <Pressable style={[styles.button, { backgroundColor: bgColor }]} onPress={onPress}>
      <IconComponent size={18} color={colors.card} strokeWidth={2} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.pill,
    alignSelf: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontFamily: fonts.interMedium,
    fontSize: 15,
    color: colors.card,
  },
});
