import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.ONLINE_TICKET_NEON_DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "ONLINE_TICKET_NEON_DATABASE_URL environment variable is not set. Please check your .env file or environment variables."
  );
}

const sql = neon(databaseUrl);
export const onlineTicketDb = drizzle(sql, { schema });
