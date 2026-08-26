import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BookOpen,
  Check,
  Coffee,
  Dumbbell,
  FileCode,
  Palmtree,
  Users,
  type LucideIcon,
} from 'lucide-react-native';

import { colors, taskIconOptions, fonts, radius, taskAccentColors } from '@/constants/theme';
import type { TaskIconName } from '@/constants/theme';
import type { Task } from '@/lib/types';
import {
  formatDateDisplay,
  formatDueLabel,
  formatRepeatSummary,
  formatTimeDisplay,
} from '@/lib/utils';

const iconMap: Record<TaskIconName, LucideIcon> = {
  users: Users,
  palmtree: Palmtree,
  filecode: FileCode,
  coffee: Coffee,
  bookopen: BookOpen,
  dumbbell: Dumbbell,
};

const CIRCLE_SIZE = 24;
const CIRCLE_STROKE = 1.75;

function resolveTaskIcon(icon: string): LucideIcon {
  const key = taskIconOptions.find((name) => name === icon.toLowerCase());
  return iconMap[key ?? 'users'];
}

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

/** タスク一覧で使う共有カード。タップで編集、チェックで完了を切り替える。 */
export function TaskCard({ task, onPress, onToggleComplete }: TaskCardProps) {
  const isComplete = task.completedAt != null;
  const accentColor = taskAccentColors[task.accent];
  const IconComponent = resolveTaskIcon(task.icon);
  const repeatSummary = formatRepeatSummary(task.repeatType, task.repeatWeekdays);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.iconSquare}>
        <IconComponent size={22} color={colors.text} strokeWidth={1.8} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, isComplete && styles.titleCompleted]} numberOfLines={2}>
          {task.name}
        </Text>
        {task.startDate ? (
          <Text style={styles.meta}>Start: {formatDateDisplay(task.startDate)}</Text>
        ) : null}
        {task.dueDate ? (
          <Text style={styles.meta}>Due: {formatDueLabel(task.dueDate)}</Text>
        ) : null}
        {task.dueTime ? (
          <Text style={styles.meta}>Time: {formatTimeDisplay(task.dueTime)}</Text>
        ) : null}
        {repeatSummary ? <Text style={styles.meta}>{repeatSummary}</Text> : null}
      </View>
      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onToggleComplete();
        }}
        style={styles.completeButton}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isComplete }}
        accessibilityLabel={isComplete ? 'Mark task incomplete' : 'Mark task complete'}
      >
        <View style={[styles.circle, isComplete && styles.circleCompleted]}>
          {isComplete ? <Check size={14} color={colors.card} strokeWidth={2.5} /> : null}
        </View>
      </Pressable>
    </Pressable>
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
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.iconSquare,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 10,
    paddingRight: 8,
    gap: 2,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 17,
    color: colors.text,
  },
  titleCompleted: {
    opacity: 0.5,
  },
  meta: {
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
