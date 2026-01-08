"use server"

import { db } from "@/db"
import { beaches, photos, vibes, activities, favorites, facilities, bestMonths } from "@/db/schema"
import { GetBeachesInputSchema, GetBeachesResponse, GetBeachBySlugResponse, FilterOptions } from "@/lib/schemas"
import { eq, and, sql, desc, inArray } from "drizzle-orm"
import { cookies } from "next/headers"

// Helper to get session ID (read-only for queries)
async function getSessionId() {
  const cookieStore = await cookies()
  return cookieStore.get("session_id")?.value
}

export async function getBeaches(input: any): Promise<GetBeachesResponse> {
  const { country, vibe, activity, limit, cursor, favoritesOnly } = GetBeachesInputSchema.parse(input)
  const sessionId = await getSessionId()
  const crowd = input.crowd
  const accessibility = input.accessibility

  let beachIds: string[] | null = null

  // Filter by Vibe
  if (vibe) {
    const vibeMatches = await db
      .select({ beachId: vibes.beachId })
      .from(vibes)
      .where(eq(vibes.name, vibe))
    beachIds = vibeMatches.map((v: any) => v.beachId)
    if (!beachIds || beachIds.length === 0) return { beaches: [], nextCursor: null, hasMore: false }
  }

  // Filter by Activity
  if (activity) {
    const activityMatches = await db
      .select({ beachId: activities.beachId })
      .from(activities)
      .where(eq(activities.name, activity))
    const activityBeachIds = activityMatches.map((a: any) => a.beachId)

    if (beachIds) {
      beachIds = beachIds.filter((id: string) => activityBeachIds.includes(id))
    } else {
      beachIds = activityBeachIds
    }
    if (!beachIds || beachIds.length === 0) return { beaches: [], nextCursor: null, hasMore: false }
  }

  // Build Query
  const conditions = []
  if (country) conditions.push(eq(beaches.country, country))
  if (crowd) conditions.push(eq(beaches.crowdLevel, crowd))
  if (accessibility) conditions.push(eq(beaches.accessibility, accessibility))
  if (cursor) conditions.push(sql`${beaches.id} < ${cursor}`)
  
  if (beachIds) {
    conditions.push(inArray(beaches.id, beachIds))
  }

  // Filter by Favorites
  if (favoritesOnly && sessionId) {
    const userFavorites = await db
      .select({ beachId: favorites.beachId })
      .from(favorites)
      .where(eq(favorites.sessionId, sessionId))
    const favoriteIds = userFavorites.map((f: any) => f.beachId)

    if (beachIds) {
      // Already filtered by vibe/activity, so intersect
      // Wait, beachIds is already in conditions. So we just need to add favoriteIds to conditions.
      conditions.push(inArray(beaches.id, favoriteIds))
    } else {
      conditions.push(inArray(beaches.id, favoriteIds))
    }
  } else if (favoritesOnly && !sessionId) {
    return { beaches: [], nextCursor: null, hasMore: false }
  }

  const query = db.select().from(beaches)
    .where(and(...conditions))
    .limit(limit + 1)
    .orderBy(desc(beaches.id))

  const result = await query

  let nextCursor: string | null = null
  if (result.length > limit) {
    const nextItem = result.pop()
    nextCursor = nextItem?.id || null
  }

  // Fetch related data for each beach
  const enrichedBeaches = await Promise.all(result.map(async (beach: any) => {
    const [beachPhotos, beachVibes, beachFav] = await Promise.all([
      db.select().from(photos).where(eq(photos.beachId, beach.id)).limit(1),
      db.select().from(vibes).where(eq(vibes.beachId, beach.id)),
      sessionId ? db.select().from(favorites).where(and(eq(favorites.beachId, beach.id), eq(favorites.sessionId, sessionId))) : []
    ])

    return {
      ...(beach as any),
      coordinates: { lat: (beach as any).lat || 0, lon: (beach as any).lon || 0 },
      primaryPhoto: beachPhotos[0] || null,
      vibes: beachVibes.map((v: any) => v.name),
      isFavorite: beachFav.length > 0
    }
  }))

  return {
    beaches: enrichedBeaches as any,
    nextCursor,
    hasMore: !!nextCursor
  }
}

export async function getBeachBySlug(slug: string): Promise<GetBeachBySlugResponse> {
  const sessionId = await getSessionId()
  
  const [beach] = await db.select().from(beaches).where(eq(beaches.slug, slug)).limit(1)

  if (!beach) return { beach: null, similarBeaches: [] }

  const [photosData, vibesData, activitiesData, facilitiesData, bestMonthsData, isFavorite] = await Promise.all([
    db.select().from(photos).where(eq(photos.beachId, beach.id)),
    db.select().from(vibes).where(eq(vibes.beachId, beach.id)),
    db.select().from(activities).where(eq(activities.beachId, beach.id)),
    db.select().from(facilities).where(eq(facilities.beachId, beach.id)),
    db.select().from(bestMonths).where(eq(bestMonths.beachId, beach.id)),
    sessionId ? db.select().from(favorites).where(and(eq(favorites.beachId, beach.id), eq(favorites.sessionId, sessionId))) : []
  ])

  const formattedBeach = {
    ...beach,
    coordinates: { lat: beach.lat || 0, lon: beach.lon || 0 },
    photos: photosData,
    vibes: vibesData.map((v: any) => v.name),
    activities: activitiesData.map((a: any) => a.name),
    facilities: facilitiesData.map((f: any) => f.name),
    bestMonths: bestMonthsData.map((m: any) => m.month),
    isFavorite: isFavorite.length > 0,
    fetchedAt: new Date().toISOString()
  }

  // Get similar beaches (same country or same vibes)
  // Simplified: same country
  const similar = await db.query.beaches.findMany({
    where: and(eq(beaches.country, beach.country), sql`${beaches.id} != ${beach.id}`),
    limit: 4,
    with: {
      photos: { limit: 1 },
      vibes: true
    }
  })

  const formattedSimilar = similar.map((b: any) => ({
    ...b,
    primaryPhoto: b.photos[0] || null,
    vibes: b.vibes.map((v: any) => v.name),
    isFavorite: false 
  }))

  return {
    beach: formattedBeach as any,
    similarBeaches: formattedSimilar as any
  }
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const allCountries = await db.selectDistinct({ country: beaches.country }).from(beaches)
  const allVibes = await db.selectDistinct({ name: vibes.name }).from(vibes)
  const allActivities = await db.selectDistinct({ name: activities.name }).from(activities)

  return {
    countries: allCountries.map((c: any) => c.country).sort(),
    vibes: allVibes.map((v: any) => v.name).sort(),
    activities: allActivities.map((a: any) => a.name).sort()
  }
}
