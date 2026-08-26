import { expo } from "@better-auth/expo";
import {
  account,
  session,
  user,
  verification,
} from "@todo/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { uuidv7 } from "./lib/uuid";
import type { DrizzleDb, Env } from "./types";

export function createAuth(db: DrizzleDb, env: Env) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      database: {
        generateId: () => uuidv7(),
      },
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    plugins: [expo()],
    session: {
      expiresIn: 60 * 60 * 24 * 400, // 400 days (Workers Cookie Max-Age cap)
      updateAge: 60 * 60 * 24, // 1 day
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    trustedOrigins: [
      "todoapp://",
      "exp://",
      "exp://**",
      "http://localhost:*",
      "http://127.0.0.1:*",
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
