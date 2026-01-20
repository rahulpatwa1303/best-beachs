import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { beaches } from "../db/schema";
import { ilike } from "drizzle-orm";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  const result = await db.select({ name: beaches.name, slug: beaches.slug }).from(beaches).where(ilike(beaches.name, "%Agassaim%"));
  console.log("Found beaches:", result);
  await client.end();
}

main();
