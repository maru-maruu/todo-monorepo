import { drizzle } from "drizzle-orm/d1";
import * as schema from "@todo/db";
import type { Auth } from "./auth";

export type Env = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

export type AppVariables = {
  db: DrizzleDb;
  auth: Auth;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
  };
};

export type AppEnv = {
  Bindings: Env;
  Variables: AppVariables;
};
