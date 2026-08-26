import { differenceInCalendarDays, format, parseISO, startOfToday } from 'date-fns';

import { colors, fonts } from '@/constants/theme';
import type { RepeatType } from '@/lib/types';

/** 期限日を Today / Tomorrow / N days 形式のラベルに変換する。 */
export function formatDueLabel(dueDate: string): string {
  const today = startOfToday();
  const due = parseISO(dueDate);
  const diffDays = differenceInCalendarDays(due, today);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `${diffDays} days`;
}

/** 表示名から先頭の名前部分を取り出す。 */
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

const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** 暦日文字列を短い表示ラベルに変換する。 */
export function formatDateDisplay(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE, MMM d');
}

/** タイムスタンプを読み取り専用表示用に整形する。 */
export function formatTimestampDisplay(value: Date): string {
  return format(value, 'MMM d, yyyy h:mm a');
}

/** 繰り返し種別と曜日からカード用の要約ラベルを作る。 */
export function formatRepeatSummary(
  repeatType: RepeatType | null | undefined,
  repeatWeekdays?: number[] | null,
): string | null {
  if (!repeatType) return null;

  if (repeatType === 'daily') return 'Daily';
  if (repeatType === 'monthly') return 'Monthly';
  if (repeatType === 'yearly') return 'Yearly';

  const weekdays = repeatWeekdays ?? [];
  if (weekdays.length === 7) return 'Weekly · Every day';
  if (weekdays.length === 5 && weekdays.every((day) => day < 5)) {
    return 'Weekly · Weekdays';
  }
  if (weekdays.length === 0) return 'Weekly';

  const sorted = [...weekdays].sort((a, b) => a - b);
  const labels = sorted.map((day) => weekdayNames[day]).join(', ');
  return `Weekly · ${labels}`;
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
