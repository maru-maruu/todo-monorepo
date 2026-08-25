import type {
  DailyTask,
  NewDailyTask,
  NewTask,
  Task,
  TaskAccent,
  UserSettings,
} from '@todo/db/types';

/** API-facing settings shape (maps DB `notificationsEnabled` → `notifications`). */
export interface Settings {
  notifications: boolean;
  reminderTime: string;
  theme: string;
  accentColor: TaskAccent;
}

export type {
  DailyTask,
  NewDailyTask,
  NewTask,
  Task,
  TaskAccent,
  UserSettings,
};

export interface CreateTaskInput {
  title: string;
  dueDate: string;
  accent: TaskAccent;
  completed?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  dueDate?: string;
  accent?: TaskAccent;
  completed?: boolean;
}

export interface CreateDailyTaskInput {
  title: string;
  icon: string;
  time: string;
  days: number[];
  enabled: boolean;
}

export interface UpdateDailyTaskInput {
  title?: string;
  icon?: string;
  time?: string;
  days?: number[];
  enabled?: boolean;
}

export interface UpdateSettingsInput {
  notifications?: boolean;
  reminderTime?: string;
  theme?: string;
  accentColor?: TaskAccent;
}

export function mapUserSettingsToApi(settings: UserSettings): Settings {
  return {
    notifications: settings.notificationsEnabled,
    reminderTime: settings.reminderTime,
    theme: settings.theme === 'light-cream' ? 'Light Cream' : settings.theme,
    accentColor: settings.accentColor as TaskAccent,
  };
}
