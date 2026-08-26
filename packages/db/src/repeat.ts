import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  format,
  getISODay,
  isBefore,
  isEqual,
  parseISO,
} from "date-fns";
import type { RepeatType } from "./schema";

/** 繰り返し計算に使う日付列の入力。 */
export type RepeatDateInput = {
  startDate?: string | null;
  dueDate?: string | null;
  repeatType: RepeatType | null;
  repeatWeekdays?: number[] | null;
};

/** 次回発生後の startDate / dueDate。 */
export type NextOccurrenceDates = {
  startDate?: string | null;
  dueDate?: string | null;
};

/** Today タブのフィルタ判定に使うタスクの最小フィールド。 */
export type TaskForTodayFilter = {
  startDate?: string | null;
  dueDate?: string | null;
  repeatType: RepeatType | null;
  completedAt?: Date | null;
};

/** Recurring タブのフィルタ判定に使うタスクの最小フィールド。 */
export type TaskForRecurringFilter = {
  repeatType: RepeatType | null;
  completedAt?: Date | null;
};

/**
 * 発生日を返す。dueDate があればそれ、なければ startDate。
 */
export function getOccurrenceDate(input: {
  startDate?: string | null;
  dueDate?: string | null;
}): string {
  const occurrence = input.dueDate ?? input.startDate;
  if (!occurrence) {
    throw new Error("Occurrence date requires dueDate or startDate");
  }
  return occurrence;
}

/**
 * 完了行から次回インスタンスの startDate / dueDate を計算する。
 */
export function nextOccurrenceDates(
  input: RepeatDateInput,
): NextOccurrenceDates {
  if (!input.repeatType) {
    throw new Error("repeatType is required to compute next occurrence");
  }

  const anchor = getOccurrenceDate(input);
  const anchorDate = parseISO(anchor);
  const nextAnchor = computeNextAnchor(
    anchorDate,
    input.repeatType,
    input.repeatWeekdays,
  );
  const nextAnchorStr = format(nextAnchor, "yyyy-MM-dd");
  const dayShift = differenceInCalendarDays(nextAnchor, anchorDate);

  const result: NextOccurrenceDates = {};

  if (input.startDate != null) {
    const startDate = parseISO(input.startDate);
    result.startDate =
      input.dueDate != null
        ? format(addDays(startDate, dayShift), "yyyy-MM-dd")
        : nextAnchorStr;
  }

  if (input.dueDate != null) {
    const dueDate = parseISO(input.dueDate);
    result.dueDate =
      input.startDate != null
        ? format(addDays(dueDate, dayShift), "yyyy-MM-dd")
        : nextAnchorStr;
  }

  return result;
}

/**
 * Today タブに表示する行かどうかを判定する。
 */
export function isTaskForToday(
  task: TaskForTodayFilter,
  today: string,
): boolean {
  if (task.repeatType == null) {
    return true;
  }

  const occurrence = getOccurrenceDate(task);
  if (occurrence === today) {
    return true;
  }

  const isIncomplete = task.completedAt == null;
  const isOverdue = isBefore(parseISO(occurrence), parseISO(today));
  return isIncomplete && isOverdue;
}

/**
 * Recurring タブに表示する行かどうかを判定する。
 */
export function isTaskForRecurring(task: TaskForRecurringFilter): boolean {
  return task.repeatType != null && task.completedAt == null;
}

function computeNextAnchor(
  anchorDate: Date,
  repeatType: RepeatType,
  repeatWeekdays?: number[] | null,
): Date {
  switch (repeatType) {
    case "daily":
      return addDays(anchorDate, 1);
    case "weekly":
      return nextWeeklyAnchor(anchorDate, repeatWeekdays);
    case "monthly":
      return addMonths(anchorDate, 1);
    case "yearly":
      return addYears(anchorDate, 1);
  }
}

function nextWeeklyAnchor(
  anchorDate: Date,
  repeatWeekdays?: number[] | null,
): Date {
  if (!repeatWeekdays || repeatWeekdays.length === 0) {
    throw new Error("repeatWeekdays is required for weekly repeat");
  }

  const anchorWeekday = getISODay(anchorDate) - 1;
  const sortedWeekdays = [...repeatWeekdays].sort((a, b) => a - b);

  for (const weekday of sortedWeekdays) {
    if (weekday > anchorWeekday) {
      const daysToAdd = weekday - anchorWeekday;
      return addDays(anchorDate, daysToAdd);
    }
  }

  const firstWeekday = sortedWeekdays[0];
  const daysUntilSunday = 6 - anchorWeekday;
  const daysFromNextMonday = firstWeekday;
  const daysToAdd = daysUntilSunday + 1 + daysFromNextMonday;
  return addDays(anchorDate, daysToAdd);
}

/**
 * 発生日が指定日と一致するか（暦日比較）。
 */
export function isOccurrenceOnDate(
  input: { startDate?: string | null; dueDate?: string | null },
  date: string,
): boolean {
  const occurrence = getOccurrenceDate(input);
  return isEqual(parseISO(occurrence), parseISO(date));
}
