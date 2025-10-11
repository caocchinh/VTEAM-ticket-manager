import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/drizzle/silencio/schema.ts",
  out: "./src/drizzle/silencio/migrations",
  dialect: "postgresql",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.SILENCIO_QUEUE_NEON_DATABASE_URL as string,
  },
});
