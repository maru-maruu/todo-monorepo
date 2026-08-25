import { tasks } from "@todo/db";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../types";

const tasksRouter = new Hono<AppEnv>();

tasksRouter.get("/", async (c) => {
  const user = c.get("user");
  const db = c.get("db");

  const rows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, user.id))
    .orderBy(tasks.createdAt);

  return c.json(rows);
});

tasksRouter.post("/", async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const body = await c.req.json<{
    title: string;
    dueDate?: string | null;
    accent?: "pink" | "brown" | "green";
    completed?: boolean;
  }>();

  if (!body.title?.trim()) {
    return c.json({ error: "title is required" }, 400);
  }

  const id = crypto.randomUUID();
  const [row] = await db
    .insert(tasks)
    .values({
      id,
      userId: user.id,
      title: body.title.trim(),
      dueDate: body.dueDate ?? null,
      accent: body.accent ?? "pink",
      completed: body.completed ?? false,
    })
    .returning();

  return c.json(row, 201);
});

tasksRouter.patch("/:id", async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const id = c.req.param("id");
  const body = await c.req.json<{
    title?: string;
    dueDate?: string | null;
    accent?: "pink" | "brown" | "green";
    completed?: boolean;
  }>();

  const updates: Partial<typeof tasks.$inferInsert> = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
  if (body.accent !== undefined) updates.accent = body.accent;
  if (body.completed !== undefined) updates.completed = body.completed;

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  const [row] = await db
    .update(tasks)
    .set(updates)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning();

  if (!row) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.json(row);
});

tasksRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const id = c.req.param("id");

  const [row] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning();

  if (!row) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.body(null, 204);
});

export { tasksRouter };
