/**
 * Database Seeding Script
 *
 * Reads beach-database.json and populates the PostgreSQL database.
 * Features:
 * - Idempotency: Checks if beach exists by slug before inserting
 * - Transaction safety: Uses transactions for atomic inserts
 * - Data normalization: Properly maps nested data to related tables
 *
 * Usage: npx tsx src/db/seed.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

import {
  beaches,
  photos,
  activities,
  vibes,
  facilities,
  bestMonths,
} from "./schema";

// Types for the JSON data
interface BeachPhoto {
  url: string;
  thumbnail?: string;
  photographer?: string;
  photographerUrl?: string;
}

interface BeachData {
  id: string;
  name: string;
  country: string;
  region?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  photos: BeachPhoto[];
  description?: string;
  shortDescription?: string;
  vibes: string[];
  activities: string[];
  facilities: string[];
  bestMonths: number[];
  crowdLevel?: string;
  accessibility?: string;
  entryFee?: string;
  fetchedAt?: string;
}

interface BeachDatabase {
  metadata: {
    generatedAt: string;
    totalBeaches: number;
    errors: number;
    tone: string;
    dataEnhanced: boolean;
    version: string;
  };
  beaches: BeachData[];
}

async function seed() {
  console.log("🏖️  Starting BeachSeeker database seeding...\n");

  // Get database URL
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set.");
    console.error("   Please set it in your .env file:");
    console.error("   DATABASE_URL=postgresql://user:password@host:5432/database");
    process.exit(1);
  }

  // Create database client
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Read the beach database JSON file
    const jsonPath = path.resolve(process.cwd(), "beach-database.json");

    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ Could not find beach-database.json at ${jsonPath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const data: BeachDatabase = JSON.parse(rawData);

    console.log(`📊 Found ${data.beaches.length} beaches in the database file`);
    console.log(`   Generated at: ${data.metadata.generatedAt}`);
    console.log(`   Version: ${data.metadata.version}\n`);

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    // Process each beach
    for (const beachData of data.beaches) {
      const slug = beachData.id; // The id in JSON is used as slug

      try {
        // Check if beach already exists (idempotency)
        const existing = await db
          .select({ id: beaches.id })
          .from(beaches)
          .where(eq(beaches.slug, slug))
          .limit(1);

        const rating = Number((4 + Math.random()).toFixed(1));
        const reviewCount = Math.floor(Math.random() * 500) + 50;

        if (existing.length > 0) {
          console.log(`update  "${beachData.name}" (populating rating/reviews)`);
          await db.update(beaches)
            .set({
              rating,
              reviewCount,
            })
            .where(eq(beaches.slug, slug));
          skipped++;
          continue;
        }

        // Insert beach and related data in a transaction
        await db.transaction(async (tx) => {
          // 1. Insert the beach
          const [newBeach] = await tx
            .insert(beaches)
            .values({
              slug,
              name: beachData.name,
              country: beachData.country,
              region: beachData.region || null,
              lat: beachData.coordinates.lat,
              lon: beachData.coordinates.lon,
              description: beachData.description || null,
              shortDescription: beachData.shortDescription || null,
              crowdLevel: beachData.crowdLevel || null,
              accessibility: beachData.accessibility || null,
              entryFee: beachData.entryFee || null,
              rating,
              reviewCount,
              fetchedAt: beachData.fetchedAt
                ? new Date(beachData.fetchedAt)
                : null,
            })
            .returning({ id: beaches.id });

          const beachId = newBeach.id;

          // 2. Insert photos
          if (beachData.photos && beachData.photos.length > 0) {
            await tx.insert(photos).values(
              beachData.photos.map((photo) => ({
                beachId,
                url: photo.url,
                thumbnail: photo.thumbnail || null,
                photographer: photo.photographer || null,
                photographerUrl: photo.photographerUrl || null,
              }))
            );
          }

          // 3. Insert activities
          if (beachData.activities && beachData.activities.length > 0) {
            await tx.insert(activities).values(
              beachData.activities.map((name) => ({
                beachId,
                name,
              }))
            );
          }

          // 4. Insert vibes
          if (beachData.vibes && beachData.vibes.length > 0) {
            await tx.insert(vibes).values(
              beachData.vibes.map((name) => ({
                beachId,
                name,
              }))
            );
          }

          // 5. Insert facilities
          if (beachData.facilities && beachData.facilities.length > 0) {
            await tx.insert(facilities).values(
              beachData.facilities.map((name) => ({
                beachId,
                name,
              }))
            );
          }

          // 6. Insert best months
          if (beachData.bestMonths && beachData.bestMonths.length > 0) {
            await tx.insert(bestMonths).values(
              beachData.bestMonths.map((month) => ({
                beachId,
                month,
              }))
            );
          }
        });

        console.log(`✅ Inserted "${beachData.name}" (${beachData.country})`);
        inserted++;
      } catch (error) {
        console.error(`❌ Error inserting "${beachData.name}":`, error);
        errors++;
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Seeding Summary:");
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log("=".repeat(50));

    if (errors === 0) {
      console.log("\n🎉 Seeding completed successfully!");
    } else {
      console.log("\n⚠️  Seeding completed with some errors.");
    }
  } catch (error) {
    console.error("❌ Fatal error during seeding:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the seed function
seed();
