/**
 * OpenStreetMap (OSM) Beach Fetcher
 * 
 * Fetches real beach data from OpenStreetMap using the Overpass API.
 * Focuses on factual accuracy and avoids hallucinations.
 * 
 * Usage: npx tsx src/scripts/fetch_osm_beaches.ts [country_name]
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const OVERPASS_INSTANCES = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function fetchWikipediaSummary(title: string) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    const response = await axios.get(url, { 
      headers: { 'User-Agent': 'BeachAtlas/1.0 (https://github.com/rahulpatwa1303/best-beachs; rahulpatwa1303@gmail.com)' },
      timeout: 5000 
    });
    const data = response.data as any;
    if (data.type === 'standard') {
      console.log(`📖 Found Wikipedia summary for: ${title}`);
      return data.extract;
    }
    return null;
  } catch (error: any) {
    console.warn(`⚠️ Wikipedia summary not found for: ${title} (${error.message})`);
    return null;
  }
}

async function fetchPhotoFromUnsplash(name: string) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name)}&per_page=1`;
    const response = await axios.get(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      timeout: 5000
    });
    const data = response.data as any;
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      return {
        url: photo.urls.regular,
        thumbnail: photo.urls.thumb,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function fetchBeachesFromOSM(country: string, bbox?: string) {
  console.log(`🔍 Fetching beaches in ${bbox ? `bbox ${bbox}` : country} from OpenStreetMap...`);

  let areaQuery = `area["name"="${country}"]["admin_level"="2"]->.searchArea;`;
  let filter = `(area.searchArea)`;

  if (bbox) {
    areaQuery = "";
    filter = `(${bbox})`;
  }

  const query = `
    [out:json][timeout:180];
    ${areaQuery}
    (
      node["natural"="beach"]${filter};
      way["natural"="beach"]${filter};
      relation["natural"="beach"]${filter};
    );
    out center;
  `;

  let success = false;
  let elements: OSMElement[] = [];

  for (const instance of OVERPASS_INSTANCES) {
    try {
      console.log(`📡 Trying Overpass instance: ${instance}`);
      const response = await axios.post(instance, `data=${encodeURIComponent(query)}`, { timeout: 60000 });
      elements = response.data.elements;
      success = true;
      break;
    } catch (error) {
      console.warn(`⚠️ Instance ${instance} failed or timed out.`);
    }
  }

  if (!success) {
    console.error("❌ All Overpass instances failed.");
    return [];
  }

    console.log(`✅ Found ${elements.length} beaches in ${country}.`);

    const formattedBeaches: any[] = [];
    const batchSize = 5;

    for (let i = 0; i < elements.length; i += batchSize) {
      const batch = elements.slice(i, i + batchSize);
      console.log(`⏳ Processing batch ${i / batchSize + 1}/${Math.ceil(elements.length / batchSize)}...`);

      const batchResults = (await Promise.all(batch.map(async (el) => {
        const lat = el.lat || el.center?.lat || 0;
        const lon = el.lon || el.center?.lon || 0;
        const tags = el.tags || {};
        const name = tags.name;

        // Skip unnamed beaches to ensure data quality
        if (!name || name.toLowerCase().includes("unnamed")) {
          return null;
        }

        const region = tags["addr:state"] || tags["addr:province"] || tags.region || null;

        let description = null;
        if (tags.wikipedia) {
          const wikiTitle = tags.wikipedia.split(':')[1] || tags.wikipedia;
          description = await fetchWikipediaSummary(wikiTitle);
        } else if (name.toLowerCase().includes("beach")) {
          description = await fetchWikipediaSummary(name);
        }

        // Improved Unsplash query with location context
        const photoQuery = `${name} beach ${region || ''} ${country}`.trim();
        const photo = await fetchPhotoFromUnsplash(photoQuery);

        return {
          id: `osm-${el.id}`,
          name,
          country: country,
          region,
          coordinates: { lat, lon },
          description,
          shortDescription: tags.description || null,
          photos: photo ? [photo] : [],
          vibes: [],
          activities: [],
          facilities: [],
          bestMonths: [],
          crowdLevel: null,
          accessibility: tags.wheelchair === 'yes' ? 'easy' : null,
          entryFee: tags.fee === 'no' ? 'free' : (tags.fee === 'yes' ? 'paid' : null),
          wikipedia: tags.wikipedia || null,
          website: tags.website || null,
          osmId: el.id,
          fetchedAt: new Date().toISOString()
        };
      }))).filter(b => b !== null);

      formattedBeaches.push(...batchResults);
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return formattedBeaches;
}

async function main() {
  const arg = process.argv[2] || "India";
  let beaches;

  if (arg.includes(',')) {
    // Assume it's a bbox: minLat,minLon,maxLat,maxLon
    beaches = await fetchBeachesFromOSM("", arg);
  } else {
    beaches = await fetchBeachesFromOSM(arg);
  }

  if (beaches.length > 0) {
    const fileName = arg.includes(',') ? `bbox-${arg.replace(/,/g, '-')}` : arg.toLowerCase();
    const outputPath = path.resolve(process.cwd(), `osm-beaches-${fileName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(beaches, null, 2));
    console.log(`💾 Saved ${beaches.length} beaches to ${outputPath}`);
  }
}

main();
