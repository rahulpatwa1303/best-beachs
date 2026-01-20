import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log("Applying migration...");
  try {
    await client`
      CREATE TABLE IF NOT EXISTS "videos" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "beach_id" uuid NOT NULL,
        "url" text NOT NULL,
        "thumbnail" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    
    await client`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'videos_beach_id_beaches_id_fk') THEN 
          ALTER TABLE "videos" ADD CONSTRAINT "videos_beach_id_beaches_id_fk" FOREIGN KEY ("beach_id") REFERENCES "public"."beaches"("id") ON DELETE cascade ON UPDATE no action; 
        END IF; 
      END $$;
    `;
    
    console.log("Migration applied successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

main();
