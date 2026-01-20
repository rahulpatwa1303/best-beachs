/**
 * Photo Backfilling Script
 * 
 * Finds beaches in the database that are missing photos and fetches them from Unsplash.
 * 
 * Usage: npx tsx src/scripts/backfill_photos.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, isNull, sql, and, notInArray } from "drizzle-orm";
import axios from "axios";
import * as dotenv from "dotenv";
import { beaches, photos } from "../db/schema";

dotenv.config();

async function fetchPhotoFromUnsplash(name: string, country: string, region: string | null) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error("❌ UNSPLASH_ACCESS_KEY is not set.");
    return null;
  }

  // Skip unnamed beaches
  if (!name || name.toLowerCase().includes("unnamed")) {
    return null;
  }

  const queries = [
    `${name} beach ${region || ''} ${country}`,
    `${name} beach ${country}`,
    `${name} beach`,
  ].map(q => q.trim());

  for (const query of queries) {
    try {
      console.log(`🔍 Searching Unsplash for: "${query}"`);
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
      const response = await axios.get(url, {
        headers: { Authorization: `Client-ID ${accessKey}` },
        timeout: 5000
      });
      
      const data = response.data as any;
      if (data.results && data.results.length > 0) {
        const photo = data.results[0];
        console.log(`✅ Found photo for "${query}" by ${photo.user.name}`);
        return {
          url: photo.urls.regular,
          thumbnail: photo.urls.thumb,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html
        };
      }
    } catch (error: any) {
      console.warn(`⚠️ Unsplash search failed for "${query}": ${error.message}`);
      if (error.response?.status === 403) {
        console.error("❌ Unsplash API rate limit exceeded or invalid key.");
        return "STOP"; // Signal to stop processing
      }
    }
    // Small delay between retries
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return null;
}

async function main() {
  console.log("📸 Starting beach photo backfill...\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // 1. Find beaches without photos
    // We need to find beaches that don't have any entries in the photos table
    const beachesWithPhotos = await db.select({ beachId: photos.beachId }).from(photos);
    const beachIdsWithPhotos = new Set(beachesWithPhotos.map(p => p.beachId));

    const allBeaches = await db.select().from(beaches);
    const missingPhotos = allBeaches.filter(b => !beachIdsWithPhotos.has(b.id));

    console.log(`📊 Total beaches: ${allBeaches.length}`);
    console.log(`🖼️  Beaches missing photos: ${missingPhotos.length}\n`);

    if (missingPhotos.length === 0) {
      console.log("✅ All beaches already have photos.");
      return;
    }

    let updated = 0;
    let failed = 0;

    for (const beach of missingPhotos) {
      console.log(`⏳ Processing: "${beach.name}" (${beach.country})`);
      
      const photoData = await fetchPhotoFromUnsplash(beach.name, beach.country, beach.region);
      
      if (photoData === "STOP") {
        console.log("\n🛑 Stopping backfill due to API limits.");
        break;
      }

      if (photoData) {
        try {
          await db.insert(photos).values({
            beachId: beach.id,
            url: photoData.url,
            thumbnail: photoData.thumbnail,
            photographer: photoData.photographer,
            photographerUrl: photoData.photographerUrl,
          });
          console.log(`✨ Successfully updated "${beach.name}"`);
          updated++;
        } catch (error: any) {
          console.error(`❌ Failed to save photo for "${beach.name}": ${error.message}`);
          failed++;
        }
      } else {
        console.log(`❓ No photo found for "${beach.name}"`);
        failed++;
      }

      // Delay to respect rate limits (Unsplash demo apps have 50 req/hour)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Backfill Summary:");
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed/Missing: ${failed}`);
    console.log("=".repeat(50));

  } catch (error: any) {
    console.error("❌ Fatal error during backfill:", error);
  } finally {
    await client.end();
  }
}

main();
