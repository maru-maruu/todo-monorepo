import { colors, fonts } from '@/constants/theme';

export function formatDueLabel(dueDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `${diffDays} days`;
}

export function getFirstName(name?: string | null): string {
  if (!name) return 'Friend';
  return name.split(' ')[0];
}

export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatScheduleText(time: string, days: number[]): string {
  const timeStr = formatTimeDisplay(time);
  if (days.length === 7) return `Every day at ${timeStr}`;
  if (days.length === 5 && days.every((d) => d < 5)) {
    return `Weekdays at ${timeStr}`;
  }
  if (days.length === 2 && days.includes(5) && days.includes(6)) {
    return `Weekends at ${timeStr}`;
  }
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const selected = days.map((d) => dayNames[d]).join(', ');
  return `${selected} at ${timeStr}`;
}

export const sharedStyles = {
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  greeting: {
    fontFamily: fonts.inter,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: fonts.lora,
    fontSize: 28,
    color: colors.text,
    marginBottom: 20,
  },
};
