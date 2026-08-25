import { dailyTasks, tasks, userSettings } from "@todo/db";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../types";

const settingsRouter = new Hono<AppEnv>();

async function getOrCreateSettings(db: AppEnv["Variables"]["db"], userId: string) {
  const existing = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const [created] = await db
    .insert(userSettings)
    .values({ userId })
    .returning();

  return created;
}

settingsRouter.get("/", async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const settings = await getOrCreateSettings(db, user.id);
  return c.json(settings);
});

settingsRouter.patch("/", async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const body = await c.req.json<{
    notificationsEnabled?: boolean;
    reminderTime?: string;
    theme?: string;
    accentColor?: string;
  }>();

  await getOrCreateSettings(db, user.id);

  const updates: Partial<typeof userSettings.$inferInsert> = {};
  if (body.notificationsEnabled !== undefined) {
    updates.notificationsEnabled = body.notificationsEnabled;
  }
  if (body.reminderTime !== undefined) updates.reminderTime = body.reminderTime;
  if (body.theme !== undefined) updates.theme = body.theme;
  if (body.accentColor !== undefined) updates.accentColor = body.accentColor;

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  const [row] = await db
    .update(userSettings)
    .set(updates)
    .where(eq(userSettings.userId, user.id))
    .returning();

  return c.json(row);
});

settingsRouter.post("/clear-completed", async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const deleted = await db
    .delete(tasks)
    .where(and(eq(tasks.userId, user.id), eq(tasks.completed, true)))
    .returning();

  return c.json({ deletedCount: deleted.length });
});

settingsRouter.get("/export", async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const [userTasks, userDailyTasks, settings] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.userId, user.id)),
    db.select().from(dailyTasks).where(eq(dailyTasks.userId, user.id)),
    getOrCreateSettings(db, user.id),
  ]);

  return c.json({
    exportedAt: new Date().toISOString(),
    settings,
    tasks: userTasks,
    dailyTasks: userDailyTasks,
  });
});

export { settingsRouter };
