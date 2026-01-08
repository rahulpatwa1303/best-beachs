import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Use a connection pool with a single connection to prevent "too many clients" errors in dev
const client = postgres(connectionString, { 
  prepare: false,
  max: 1, // Minimum possible to avoid exhaustion
  idle_timeout: 10,
  connect_timeout: 10,
});

// Prevent multiple instances of drizzle in development
const globalForDb = global as unknown as { db: any; client: any };

if (!globalForDb.db) {
  globalForDb.db = drizzle(client, { schema });
  globalForDb.client = client;
}

export const db = globalForDb.db;
export const pgClient = globalForDb.client;

