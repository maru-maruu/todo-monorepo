import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { dailyTasks, tasks, userSettings } from "./schema";

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;
export type DailyTask = InferSelectModel<typeof dailyTasks>;
export type NewDailyTask = InferInsertModel<typeof dailyTasks>;
export type UserSettings = InferSelectModel<typeof userSettings>;
export type NewUserSettings = InferInsertModel<typeof userSettings>;

export type { TaskAccent, WeekdayIndex } from "./schema";
