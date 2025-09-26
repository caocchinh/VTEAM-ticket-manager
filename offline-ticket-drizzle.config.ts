import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/drizzle/offline/schema.ts",
  out: "./src/drizzle/offline/migrations",
  dialect: "postgresql",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.OFFLINE_TICKET_NEON_DATABASE_URL as string,
  },
});
