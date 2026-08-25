import { dailyTasks } from "@todo/db";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../types";

const dailyTasksRouter = new Hono<AppEnv>();

dailyTasksRouter.get("/", async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const rows = await db
    .select()
    .from(dailyTasks)
    .where(eq(dailyTasks.userId, user.id))
    .orderBy(dailyTasks.createdAt);

  return c.json(rows);
});

dailyTasksRouter.post("/", async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const body = await c.req.json<{
    title: string;
    icon?: string;
    time: string;
    days: number[];
    enabled?: boolean;
  }>();

  if (!body.title?.trim()) {
    return c.json({ error: "title is required" }, 400);
  }
  if (!body.time) {
    return c.json({ error: "time is required" }, 400);
  }
  if (!Array.isArray(body.days) || body.days.length === 0) {
    return c.json({ error: "days must be a non-empty number array" }, 400);
  }

  const id = crypto.randomUUID();
  const [row] = await db
    .insert(dailyTasks)
    .values({
      id,
      userId: user.id,
      title: body.title.trim(),
      icon: body.icon ?? "users",
      time: body.time,
      days: body.days,
      enabled: body.enabled ?? true,
    })
    .returning();

  return c.json(row, 201);
});

dailyTasksRouter.patch("/:id", async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const id = c.req.param("id");
  const body = await c.req.json<{
    title?: string;
    icon?: string;
    time?: string;
    days?: number[];
    enabled?: boolean;
  }>();

  const updates: Partial<typeof dailyTasks.$inferInsert> = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.time !== undefined) updates.time = body.time;
  if (body.days !== undefined) updates.days = body.days;
  if (body.enabled !== undefined) updates.enabled = body.enabled;

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  const [row] = await db
    .update(dailyTasks)
    .set(updates)
    .where(and(eq(dailyTasks.id, id), eq(dailyTasks.userId, user.id)))
    .returning();

  if (!row) {
    return c.json({ error: "Daily task not found" }, 404);
  }

  return c.json(row);
});

dailyTasksRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const id = c.req.param("id");

  const [row] = await db
    .delete(dailyTasks)
    .where(and(eq(dailyTasks.id, id), eq(dailyTasks.userId, user.id)))
    .returning();

  if (!row) {
    return c.json({ error: "Daily task not found" }, 404);
  }

  return c.body(null, 204);
});

export { dailyTasksRouter };
