/**
 * Generate Search Links Script
 * 
 * Generates a markdown file with Google Search links for images and videos for each beach.
 * 
 * Usage: npx tsx src/scripts/generate_search_links.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as fs from 'fs';
import * as path from 'path';
import { beaches } from "../db/schema";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log("Generating search links...");
  
  const allBeaches = await db.select().from(beaches).orderBy(beaches.name);
  
  let markdownContent = "# Beach Asset Search Links\n\n";
  markdownContent += "Use these links to quickly find images and videos for each beach.\n\n";
  markdownContent += "| Beach Name | Country | Images | Videos |\n";
  markdownContent += "|---|---|---|---|\n";

  for (const beach of allBeaches) {
    const query = `${beach.name} ${beach.country} beach`;
    const imageSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    const videoSearchUrl = `https://www.google.com/search?tbm=vid&q=${encodeURIComponent(query + " 4k drone")}`;
    
    markdownContent += `| **${beach.name}** | ${beach.country} | [Search Images](${imageSearchUrl}) | [Search Videos](${videoSearchUrl}) |\n`;
  }

  const outputPath = path.join(process.cwd(), 'beach_search_links.md');
  fs.writeFileSync(outputPath, markdownContent);
  
  console.log(`✅ Search links generated at: ${outputPath}`);
  await client.end();
}

main();
