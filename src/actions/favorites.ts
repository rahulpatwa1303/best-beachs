"use server"

import { db } from "@/db"
import { favorites } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

async function getSessionId() {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    cookieStore.set("session_id", sessionId, { httpOnly: true, secure: true })
  }

  return sessionId
}

export async function toggleFavorite(beachId: string) {
  const sessionId = await getSessionId()

  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.beachId, beachId), eq(favorites.sessionId, sessionId)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .delete(favorites)
      .where(and(eq(favorites.beachId, beachId), eq(favorites.sessionId, sessionId)))
  } else {
    await db.insert(favorites).values({
      beachId,
      sessionId,
    })
  }

  revalidatePath('/')
  revalidatePath('/favorites')
  revalidatePath(`/beach/[slug]`, 'page')
}
