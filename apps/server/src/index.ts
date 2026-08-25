import * as schema from "@todo/db";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import { sessionMiddleware } from "./middleware/session";
import { dailyTasksRouter } from "./routes/daily-tasks";
import { settingsRouter } from "./routes/settings";
import { tasksRouter } from "./routes/tasks";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (origin.startsWith("http://localhost:")) return origin;
      if (origin.startsWith("http://127.0.0.1:")) return origin;
      if (origin.startsWith("http://10.0.2.2:")) return origin;
      if (origin.startsWith("exp://")) return origin;
      if (origin.startsWith("todoapp://")) return origin;
      return null;
    },
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  const db = drizzle(c.env.DB, { schema });
  const auth = createAuth(db, c.env);
  c.set("db", db);
  c.set("auth", auth);
  await next();
});

app.get("/api/health", (c) => c.json({ ok: true }));

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return c.get("auth").handler(c.req.raw);
});

const api = new Hono<AppEnv>();
api.use("*", sessionMiddleware);
api.route("/tasks", tasksRouter);
api.route("/daily-tasks", dailyTasksRouter);
api.route("/settings", settingsRouter);
app.route("/api", api);

export default app;
