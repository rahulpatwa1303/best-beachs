/**
 * Asset Sync Script
 * 
 * Scans the `upload_queue` directory for beach folders.
 * Uploads images and videos to Supabase Storage.
 * Updates the database with the new assets.
 * 
 * Usage: npx tsx src/scripts/sync_assets.ts
 */

import { createClient } from '@supabase/supabase-js'
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { beaches, photos, videos } from "../db/schema";

dotenv.config()

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const BUCKET_NAME = 'assets'

// DB Setup
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}
const client = postgres(connectionString);
const db = drizzle(client);

const UPLOAD_QUEUE_DIR = path.join(process.cwd(), 'upload_queue')
const PROCESSED_DIR = path.join(UPLOAD_QUEUE_DIR, '_processed')

async function syncAssets() {
  console.log('🚀 Starting asset sync...')

  if (!fs.existsSync(UPLOAD_QUEUE_DIR)) {
    console.log(`📂 Creating upload queue directory: ${UPLOAD_QUEUE_DIR}`)
    fs.mkdirSync(UPLOAD_QUEUE_DIR)
    return
  }

  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR)
  }

  const beachFolders = fs.readdirSync(UPLOAD_QUEUE_DIR).filter(f => {
    return fs.statSync(path.join(UPLOAD_QUEUE_DIR, f)).isDirectory() && f !== '_processed'
  })

  if (beachFolders.length === 0) {
    console.log('✅ No beach folders found in upload_queue.')
    return
  }

  for (const slug of beachFolders) {
    console.log(`\n🌊 Processing beach: ${slug}`)
    
    // 1. Find beach in DB
    // Try to match by slug first
    let [beach] = await db.select().from(beaches).where(eq(beaches.slug, slug)).limit(1)

    // If not found, try to match by name (fuzzy)
    if (!beach) {
      const normalizedSlug = slug.replace(/[_-]/g, ' ').toLowerCase()
      const allBeaches = await db.select().from(beaches)
      
      beach = allBeaches.find(b => {
        const normalizedName = b.name.toLowerCase()
        return normalizedName === normalizedSlug || 
               normalizedName.replace(/ beach$/, '') === normalizedSlug ||
               normalizedName === normalizedSlug + ' beach'
      })
    }
    
    if (!beach) {
      console.warn(`⚠️ Beach not found in DB: ${slug}. Skipping...`)
      continue
    }
    
    console.log(`   ✅ Matched to: ${beach.name} (${beach.slug})`)

    const beachDir = path.join(UPLOAD_QUEUE_DIR, slug)
    const files = fs.readdirSync(beachDir)

    for (const file of files) {
      if (file.startsWith('.')) continue // Skip hidden files

      const filePath = path.join(beachDir, file)
      const fileStats = fs.statSync(filePath)
      
      if (fileStats.isDirectory()) continue

      console.log(`   📤 Uploading ${file}...`)
      
      const fileBuffer = fs.readFileSync(filePath)
      const contentType = getContentType(file)
      const storagePath = `beaches/${slug}/${file}`

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: true
        })

      if (uploadError) {
        console.error(`   ❌ Upload failed: ${uploadError.message}`)
        continue
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath)
      
      const publicUrl = publicUrlData.publicUrl

      // Update DB
      try {
        if (contentType.startsWith('video/')) {
          await db.insert(videos).values({
            beachId: beach.id,
            url: publicUrl,
            thumbnail: null // Could generate thumbnail later
          })
          console.log(`   ✅ Video added to DB`)
        } else if (contentType.startsWith('image/')) {
          await db.insert(photos).values({
            beachId: beach.id,
            url: publicUrl,
            thumbnail: publicUrl, // Use same URL for thumbnail for now
            photographer: 'Manual Upload',
            photographerUrl: null
          })
          console.log(`   ✅ Photo added to DB`)
        }

        // Move to processed
        const processedBeachDir = path.join(PROCESSED_DIR, slug)
        if (!fs.existsSync(processedBeachDir)) {
          fs.mkdirSync(processedBeachDir)
        }
        fs.renameSync(filePath, path.join(processedBeachDir, file))

      } catch (dbError: any) {
        console.error(`   ❌ DB Update failed: ${dbError.message}`)
      }
    }
    
    // Remove empty beach folder
    if (fs.readdirSync(beachDir).length === 0) {
      fs.rmdirSync(beachDir)
    }
  }

  console.log('\n✨ Sync complete!')
  await client.end()
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.webp':
      return 'image/webp'
    case '.mp4':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    case '.mov':
      return 'video/quicktime'
    default:
      return 'application/octet-stream'
  }
}

syncAssets()
