/**
 * Database Cleanup Script
 * 
 * Removes all beaches with "Unnamed" in their name and their associated data.
 * 
 * Usage: npx tsx src/scripts/cleanup_unnamed.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { like, inArray, eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import { beaches, photos, activities, vibes, facilities, bestMonths, favorites } from "../db/schema";

dotenv.config();

async function main() {
  console.log("🧹 Starting database cleanup for unnamed beaches...\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // 1. Find unnamed beaches
    const unnamedBeaches = await db
      .select({ id: beaches.id, name: beaches.name })
      .from(beaches)
      .where(like(beaches.name, "%Unnamed%"));

    console.log(`🔍 Found ${unnamedBeaches.length} unnamed beaches.`);

    if (unnamedBeaches.length === 0) {
      console.log("✅ No unnamed beaches found.");
      return;
    }

    const idsToRemove = unnamedBeaches.map(b => b.id);

    // 2. Remove associated data in a transaction
    await db.transaction(async (tx) => {
      console.log("🗑️  Removing associated photos...");
      await tx.delete(photos).where(inArray(photos.beachId, idsToRemove));

      console.log("🗑️  Removing associated activities...");
      await tx.delete(activities).where(inArray(activities.beachId, idsToRemove));

      console.log("🗑️  Removing associated vibes...");
      await tx.delete(vibes).where(inArray(vibes.beachId, idsToRemove));

      console.log("🗑️  Removing associated facilities...");
      await tx.delete(facilities).where(inArray(facilities.beachId, idsToRemove));

      console.log("🗑️  Removing associated best months...");
      await tx.delete(bestMonths).where(inArray(bestMonths.beachId, idsToRemove));

      console.log("🗑️  Removing associated favorites...");
      await tx.delete(favorites).where(inArray(favorites.beachId, idsToRemove));

      console.log("🗑️  Removing beaches...");
      await tx.delete(beaches).where(inArray(beaches.id, idsToRemove));
    });

    console.log(`\n✅ Successfully removed ${unnamedBeaches.length} beaches and their data.`);

  } catch (error: any) {
    console.error("❌ Fatal error during cleanup:", error);
  } finally {
    await client.end();
  }
}

main();
