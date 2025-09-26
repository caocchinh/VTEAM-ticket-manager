import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/drizzle/online/schema.ts",
  out: "./src/drizzle/online/migrations",
  dialect: "postgresql",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.ONLINE_TICKET_NEON_DATABASE_URL as string,
  },
});
