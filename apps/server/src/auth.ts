import { expo } from "@better-auth/expo";
import {
  account,
  session,
  user,
  verification,
} from "@todo/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DrizzleDb, Env } from "./types";

export function createAuth(db: DrizzleDb, env: Env) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
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
