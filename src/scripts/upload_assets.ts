/**
 * Asset Upload Script
 * 
 * Uploads all files from the local `assests` folder to the Supabase Storage bucket `assets`.
 * 
 * Usage: npx tsx src/scripts/upload_assets.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Use service role key if bucket is private/restricted, but anon key might work if policies allow

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const ASSETS_DIR = path.join(process.cwd(), 'assests')
const BUCKET_NAME = 'assets'

async function uploadAssets() {
  console.log('🚀 Starting asset upload...')

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Assets directory not found: ${ASSETS_DIR}`)
    return
  }

  const files = fs.readdirSync(ASSETS_DIR)
  let uploadedCount = 0
  let failedCount = 0

  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file)
    const fileStats = fs.statSync(filePath)

    if (fileStats.isDirectory()) continue

    const fileBuffer = fs.readFileSync(filePath)
    const contentType = getContentType(file)

    console.log(`📤 Uploading ${file}...`)

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file, fileBuffer, {
        contentType,
        upsert: true
      })

    if (error) {
      console.error(`❌ Failed to upload ${file}:`, error.message)
      failedCount++
    } else {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file)
      
      console.log(`✅ Uploaded ${file} -> ${publicUrlData.publicUrl}`)
      uploadedCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Upload Summary:')
  console.log(`   ✅ Uploaded: ${uploadedCount}`)
  console.log(`   ❌ Failed: ${failedCount}`)
  console.log('='.repeat(50))
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
    case '.mp4':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    default:
      return 'application/octet-stream'
  }
}

uploadAssets()
