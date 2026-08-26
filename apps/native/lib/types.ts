import type {
  NewTask,
  RepeatType,
  Task,
  TaskAccent,
  UserSettings,
  WeekdayIndex,
} from '@todo/db/types';

/** API 向けの設定オブジェクト（DB の notificationsEnabled を notifications に写す）。 */
export interface Settings {
  notifications: boolean;
  reminderTime: string;
  theme: string;
  accentColor: TaskAccent;
}

export type {
  NewTask,
  RepeatType,
  Task,
  TaskAccent,
  UserSettings,
  WeekdayIndex,
};

/** タスク作成 API のリクエスト body。 */
export interface CreateTaskInput {
  name: string;
  notes?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  repeatType?: RepeatType | null;
  repeatWeekdays?: number[] | null;
  icon?: string;
  accent?: TaskAccent;
}

/** タスク更新 API のリクエスト body。completedAt は完了意思（非 null）または解除（null）。 */
export interface UpdateTaskInput {
  name?: string;
  notes?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  repeatType?: RepeatType | null;
  repeatWeekdays?: number[] | null;
  icon?: string;
  accent?: TaskAccent;
  completedAt?: Date | null;
}

/** 設定更新 API のリクエスト body。 */
export interface UpdateSettingsInput {
  notifications?: boolean;
  reminderTime?: string;
  theme?: string;
  accentColor?: TaskAccent;
}

/** DB の UserSettings を API 向け Settings に変換する。 */
export function mapUserSettingsToApi(settings: UserSettings): Settings {
  return {
    notifications: settings.notificationsEnabled,
    reminderTime: settings.reminderTime,
    theme: settings.theme === 'light-cream' ? 'Light Cream' : settings.theme,
    accentColor: settings.accentColor as TaskAccent,
  };
}

/** API の設定更新 body を DB 列名のオブジェクトに変換する。 */
export function mapApiSettingsToDb(input: UpdateSettingsInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.notifications !== undefined) {
    body.notificationsEnabled = input.notifications;
  }
  if (input.reminderTime !== undefined) body.reminderTime = input.reminderTime;
  if (input.theme !== undefined) {
    body.theme = input.theme === 'Light Cream' ? 'light-cream' : input.theme;
  }
  if (input.accentColor !== undefined) body.accentColor = input.accentColor;
  return body;
}

/** エクスポート API のレスポンス shape。 */
export interface ExportData {
  exportedAt: string;
  settings: UserSettings;
  tasks: Task[];
}
