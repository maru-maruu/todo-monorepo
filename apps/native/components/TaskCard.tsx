import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { colors, fonts, radius, taskAccentColors } from '@/constants/theme';
import type { TaskAccent } from '@/lib/types';
import { formatDueLabel } from '@/lib/utils';

const CIRCLE_SIZE = 24;
const CIRCLE_STROKE = 1.75;

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
        style={styles.completeButton}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={completed ? 'Mark task incomplete' : 'Mark task complete'}
      >
        <View style={[styles.circle, completed && styles.circleCompleted]}>
          {completed ? (
            <Check size={14} color={colors.card} strokeWidth={2.5} />
          ) : null}
        </View>
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
  completeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: CIRCLE_STROKE,
    borderColor: colors.text,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: colors.accentRose,
    borderColor: colors.accentRose,
  },
});
