import { defineConfig } from "drizzle-kit";

/**
 * `drizzle-kit generate` only reads schema.ts — it never opens a connection —
 * so a missing DATABASE_URL must not block it. Throwing here made schema
 * generation impossible on a fresh clone. The placeholder keeps `generate`
 * working offline; `migrate`, `push` and `studio` do connect and will fail
 * loudly against it, which is the correct moment to require a real URL.
 */
const PLACEHOLDER = "mysql://user:password@localhost:3306/set_DATABASE_URL";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? PLACEHOLDER,
  },
});
