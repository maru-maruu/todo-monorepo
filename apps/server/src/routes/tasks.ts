import { tasks } from "@todo/db";
import type { RepeatType, TaskAccent } from "@todo/db";
import { nextOccurrenceDates } from "@todo/db/repeat";
import { and, eq } from "drizzle-orm";
import { format, isValid, parseISO } from "date-fns";
import { Hono } from "hono";
import { uuidv7 } from "../lib/uuid";
import type { AppEnv } from "../types";

const tasksRouter = new Hono<AppEnv>();

const REPEAT_TYPES = new Set<RepeatType>(["daily", "weekly", "monthly", "yearly"]);
const ACCENTS = new Set<TaskAccent>(["pink", "brown", "green"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const NOTES_MAX_LENGTH = 10_000;

type TaskBody = {
  id?: unknown;
  name?: string;
  notes?: string | null;
  icon?: string;
  accent?: TaskAccent;
  startDate?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  repeatType?: RepeatType | null;
  repeatWeekdays?: number[] | null;
  completedAt?: unknown;
  createdAt?: unknown;
  lastModifiedAt?: unknown;
};

type ParsedTaskFields = {
  name: string;
  notes: string | null;
  icon: string;
  accent: TaskAccent;
  startDate: string | null;
  dueDate: string | null;
  dueTime: string | null;
  repeatType: RepeatType | null;
  repeatWeekdays: number[] | null;
};

type ParseResult =
  | { ok: true; data: ParsedTaskFields }
  | { ok: false; error: string };

/**
 * 日付文字列が YYYY-MM-DD かつ有効な暦日か検証する。
 */
export function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }
  const parsed = parseISO(value);
  return isValid(parsed) && format(parsed, "yyyy-MM-dd") === value;
}

/**
 * POST / PATCH 共通のタスク入力を正規化し、サーバー正本のルールで検証する。
 */
export function parseTaskFields(
  body: TaskBody,
  existing: ParsedTaskFields | null,
  options: { requireName: boolean },
): ParseResult {
  let name: string;
  if (body.name !== undefined) {
    if (typeof body.name !== "string") {
      return { ok: false, error: "name must be a string" };
    }
    name = body.name.trim();
    if (!name) {
      return { ok: false, error: "name is required" };
    }
  } else if (existing) {
    name = existing.name;
  } else if (options.requireName) {
    return { ok: false, error: "name is required" };
  } else {
    return { ok: false, error: "name is required" };
  }

  let notes: string | null;
  if (body.notes !== undefined) {
    if (body.notes !== null && typeof body.notes !== "string") {
      return { ok: false, error: "notes must be a string or null" };
    }
    const trimmed = body.notes?.trim() ?? "";
    if (trimmed.length > NOTES_MAX_LENGTH) {
      return { ok: false, error: "notes must be at most 10000 characters" };
    }
    notes = trimmed.length > 0 ? trimmed : null;
  } else {
    notes = existing?.notes ?? null;
  }

  let icon: string;
  if (body.icon !== undefined) {
    if (typeof body.icon !== "string" || !body.icon.trim()) {
      return { ok: false, error: "icon must be a non-empty string" };
    }
    icon = body.icon.trim();
  } else {
    icon = existing?.icon ?? "users";
  }

  let accent: TaskAccent;
  if (body.accent !== undefined) {
    if (!ACCENTS.has(body.accent)) {
      return { ok: false, error: "accent must be pink, brown, or green" };
    }
    accent = body.accent;
  } else {
    accent = existing?.accent ?? "pink";
  }

  let startDate: string | null;
  if (body.startDate !== undefined) {
    if (body.startDate === null) {
      startDate = null;
    } else if (typeof body.startDate !== "string" || !isValidDateString(body.startDate)) {
      return { ok: false, error: "startDate must be YYYY-MM-DD or null" };
    } else {
      startDate = body.startDate;
    }
  } else {
    startDate = existing?.startDate ?? null;
  }

  let dueDate: string | null;
  if (body.dueDate !== undefined) {
    if (body.dueDate === null) {
      dueDate = null;
    } else if (typeof body.dueDate !== "string" || !isValidDateString(body.dueDate)) {
      return { ok: false, error: "dueDate must be YYYY-MM-DD or null" };
    } else {
      dueDate = body.dueDate;
    }
  } else {
    dueDate = existing?.dueDate ?? null;
  }

  let dueTime: string | null;
  if (body.dueTime !== undefined) {
    if (body.dueTime === null) {
      dueTime = null;
    } else if (typeof body.dueTime !== "string" || !TIME_PATTERN.test(body.dueTime)) {
      return { ok: false, error: "dueTime must be HH:mm or null" };
    } else {
      dueTime = body.dueTime;
    }
  } else {
    dueTime = existing?.dueTime ?? null;
  }

  let repeatType: RepeatType | null;
  if (body.repeatType !== undefined) {
    if (body.repeatType === null) {
      repeatType = null;
    } else if (!REPEAT_TYPES.has(body.repeatType)) {
      return { ok: false, error: "repeatType must be daily, weekly, monthly, yearly, or null" };
    } else {
      repeatType = body.repeatType;
    }
  } else {
    repeatType = existing?.repeatType ?? null;
  }

  let repeatWeekdays: number[] | null = null;
  if (repeatType === "weekly") {
    const rawWeekdays =
      body.repeatWeekdays !== undefined
        ? body.repeatWeekdays
        : existing?.repeatWeekdays ?? null;

    if (rawWeekdays === null || !Array.isArray(rawWeekdays) || rawWeekdays.length === 0) {
      return { ok: false, error: "repeatWeekdays is required for weekly repeat" };
    }

    const weekdays: number[] = [];
    const seen = new Set<number>();
    for (const value of rawWeekdays) {
      if (!Number.isInteger(value) || value < 0 || value > 6) {
        return { ok: false, error: "repeatWeekdays must contain integers 0-6" };
      }
      if (seen.has(value)) {
        return { ok: false, error: "repeatWeekdays must not contain duplicates" };
      }
      seen.add(value);
      weekdays.push(value);
    }
    weekdays.sort((a, b) => a - b);
    repeatWeekdays = weekdays;
  }

  if (repeatType != null && !startDate && !dueDate) {
    return { ok: false, error: "recurring tasks require startDate or dueDate" };
  }

  return {
    ok: true,
    data: {
      name,
      notes,
      icon,
      accent,
      startDate,
      dueDate,
      dueTime,
      repeatType,
      repeatWeekdays,
    },
  };
}

function existingToParsed(row: typeof tasks.$inferSelect): ParsedTaskFields {
  return {
    name: row.name,
    notes: row.notes,
    icon: row.icon,
    accent: row.accent,
    startDate: row.startDate,
    dueDate: row.dueDate,
    dueTime: row.dueTime,
    repeatType: row.repeatType,
    repeatWeekdays: row.repeatWeekdays ?? null,
  };
}

function hasPatchableFields(body: TaskBody): boolean {
  return (
    body.name !== undefined ||
    body.notes !== undefined ||
    body.icon !== undefined ||
    body.accent !== undefined ||
    body.startDate !== undefined ||
    body.dueDate !== undefined ||
    body.dueTime !== undefined ||
    body.repeatType !== undefined ||
    body.repeatWeekdays !== undefined ||
    body.completedAt !== undefined
  );
}

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
  const body = await c.req.json<TaskBody>();

  const parsed = parseTaskFields(body, null, { requireName: true });
  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const now = new Date();
  const id = uuidv7();
  const [row] = await db
    .insert(tasks)
    .values({
      id,
      userId: user.id,
      ...parsed.data,
      completedAt: null,
      createdAt: now,
      lastModifiedAt: now,
    })
    .returning();

  return c.json(row, 201);
});

tasksRouter.patch("/:id", async (c) => {
  const user = c.get("user");
  const db = c.get("db");
  const id = c.req.param("id");
  const body = await c.req.json<TaskBody>();

  if (!hasPatchableFields(body)) {
    return c.json({ error: "No fields to update" }, 400);
  }

  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Task not found" }, 404);
  }

  const parsed = parseTaskFields(body, existingToParsed(existing), {
    requireName: false,
  });
  if (!parsed.ok) {
    return c.json({ error: parsed.error }, 400);
  }

  const now = new Date();
  const updates: Partial<typeof tasks.$inferInsert> = {
    ...parsed.data,
    lastModifiedAt: now,
  };

  const isPromoting =
    existing.repeatType == null && parsed.data.repeatType != null;
  if (isPromoting && existing.completedAt != null) {
    updates.completedAt = null;
  }

  let completing = false;
  if (!isPromoting && body.completedAt !== undefined) {
    if (body.completedAt === null) {
      updates.completedAt = null;
    } else {
      if (existing.completedAt == null) {
        completing = true;
      }
      updates.completedAt = now;
    }
  }

  const effectiveRepeatType = parsed.data.repeatType;
  const shouldSpawn =
    completing &&
    effectiveRepeatType != null &&
    existing.completedAt == null;

  if (shouldSpawn) {
    let nextDates;
    try {
      nextDates = nextOccurrenceDates({
        startDate: parsed.data.startDate,
        dueDate: parsed.data.dueDate,
        repeatType: effectiveRepeatType,
        repeatWeekdays: parsed.data.repeatWeekdays,
      });
    } catch {
      return c.json({ error: "Cannot compute next occurrence for this task" }, 400);
    }

    const nextId = uuidv7();
    await db.batch([
      db
        .update(tasks)
        .set(updates)
        .where(and(eq(tasks.id, id), eq(tasks.userId, user.id))),
      db.insert(tasks).values({
        id: nextId,
        userId: user.id,
        name: parsed.data.name,
        notes: parsed.data.notes,
        icon: parsed.data.icon,
        accent: parsed.data.accent,
        startDate: nextDates.startDate ?? null,
        dueDate: nextDates.dueDate ?? null,
        dueTime: parsed.data.dueTime,
        repeatType: effectiveRepeatType,
        repeatWeekdays: parsed.data.repeatWeekdays,
        completedAt: null,
        createdAt: now,
        lastModifiedAt: now,
      }),
    ]);
  } else {
    await db
      .update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  }

  const [row] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .limit(1);

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
