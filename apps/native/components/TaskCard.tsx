import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, taskAccentColors } from '@/constants/theme';
import type { TaskAccent } from '@/lib/types';
import { formatDueLabel } from '@/lib/utils';

interface TaskCardProps {
  title: string;
  dueDate: string;
  accent: TaskAccent;
  completed: boolean;
  onToggleComplete: () => void;
}

export function TaskCard({
  title,
  dueDate,
  accent,
  completed,
  onToggleComplete,
}: TaskCardProps) {
  const accentColor = taskAccentColors[accent];

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.titleCompleted]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.due}>Due: {formatDueLabel(dueDate)}</Text>
      </View>
      <Pressable
        onPress={onToggleComplete}
        style={styles.checkbox}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
      >
        <View
          style={[
            styles.circle,
            completed && { backgroundColor: accentColor, borderColor: accentColor },
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  accentBar: {
    width: 6,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 14,
    paddingRight: 8,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 17,
    color: colors.text,
    marginBottom: 4,
  },
  titleCompleted: {
    opacity: 0.5,
  },
  due: {
    fontFamily: fonts.inter,
    fontSize: 12,
    color: colors.textMuted,
  },
  checkbox: {
    padding: 16,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.beige,
  },
});
