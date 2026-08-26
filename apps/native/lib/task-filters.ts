import { format } from 'date-fns';
import { isTaskForRecurring, isTaskForToday } from '@todo/db/repeat';

import type { Task } from './types';

/** 今日の暦日を YYYY-MM-DD 文字列で返す。 */
export function getTodayDateString(): string {
  const now = new Date();
  return format(now, 'yyyy-MM-dd');
}

/** Today タブに表示するタスクだけに絞る。 */
export function filterTasksForToday(tasks: Task[], today?: string): Task[] {
  const todayStr = today ?? getTodayDateString();
  const result: Task[] = [];

  for (const task of tasks) {
    const matches = isTaskForToday(
      {
        startDate: task.startDate,
        dueDate: task.dueDate,
        repeatType: task.repeatType,
        completedAt: task.completedAt,
      },
      todayStr,
    );
    if (matches) {
      result.push(task);
    }
  }

  return result;
}

/** Recurring タブに表示するタスクだけに絞る。 */
export function filterTasksForRecurring(tasks: Task[]): Task[] {
  const result: Task[] = [];

  for (const task of tasks) {
    const matches = isTaskForRecurring({
      repeatType: task.repeatType,
      completedAt: task.completedAt,
    });
    if (matches) {
      result.push(task);
    }
  }

  return result;
}
