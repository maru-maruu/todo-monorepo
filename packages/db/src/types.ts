import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { tasks, userSettings } from "./schema";

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;
export type UserSettings = InferSelectModel<typeof userSettings>;
export type NewUserSettings = InferInsertModel<typeof userSettings>;

export type { RepeatType, TaskAccent, WeekdayIndex } from "./schema";
