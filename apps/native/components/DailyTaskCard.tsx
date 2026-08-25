import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BookOpen,
  Coffee,
  Dumbbell,
  FileCode,
  Palmtree,
  Users,
  type LucideIcon,
} from 'lucide-react-native';

import { IOSSwitch } from '@/components/IOSSwitch';
import { colors, dayLabels, dailyIconOptions, fonts, radius } from '@/constants/theme';
import { formatScheduleText } from '@/lib/utils';
import type { DailyIconName } from '@/constants/theme';

const iconMap: Record<DailyIconName, LucideIcon> = {
  users: Users,
  palmtree: Palmtree,
  filecode: FileCode,
  coffee: Coffee,
  bookopen: BookOpen,
  dumbbell: Dumbbell,
};

function resolveDailyIcon(icon: string): LucideIcon {
  const key = dailyIconOptions.find((name) => name === icon.toLowerCase());
  return iconMap[key ?? 'users'];
}

interface DailyTaskCardProps {
  title: string;
  icon: string;
  time: string;
  days: number[];
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
}

export function DailyTaskCard({
  title,
  icon,
  time,
  days,
  enabled,
  onToggleEnabled,
}: DailyTaskCardProps) {
  const IconComponent = resolveDailyIcon(icon);
  const schedule = formatScheduleText(time, days);

  return (
    <View style={styles.card}>
      <View style={styles.iconSquare}>
        <IconComponent size={22} color={colors.text} strokeWidth={1.8} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.schedule}>{schedule}</Text>
        <View style={styles.dayPills}>
          {dayLabels.map((label, index) => {
            const isActive = days.includes(index);
            return (
              <View
                key={index}
                style={[styles.dayPill, isActive && styles.dayPillActive]}
              >
                <Text
                  style={[styles.dayText, isActive && styles.dayTextActive]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <IOSSwitch value={enabled} onValueChange={onToggleEnabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.iconSquare,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 16,
    color: colors.text,
  },
  schedule: {
    fontFamily: fonts.inter,
    fontSize: 12,
    color: colors.textMuted,
  },
  dayPills: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dayPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.beigeLight,
  },
  dayPillActive: {
    backgroundColor: colors.accentRose,
  },
  dayText: {
    fontFamily: fonts.inter,
    fontSize: 10,
    color: colors.textMuted,
  },
  dayTextActive: {
    color: colors.card,
    fontFamily: fonts.interMedium,
  },
});
