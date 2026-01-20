"use client"

import * as React from "react"
import { useInView } from "react-intersection-observer"
import { BeachCard } from "./BeachCard"
import { BeachListItem, GetBeachesResponse } from "@/lib/schemas"
import { getBeaches, getBeachesNearMe } from "@/actions/beaches"
import { Loader2 } from "lucide-react"

interface InfiniteBeachListProps {
  initialBeaches: BeachListItem[]
  initialHasMore: boolean
  initialNextCursor: string | null
  searchParams: {
    country?: string
    vibe?: string
    activity?: string
    crowd?: string
    accessibility?: string
    lat?: number
    lon?: number
  }
}

export function InfiniteBeachList({
  initialBeaches,
  initialHasMore,
  initialNextCursor,
  searchParams,
}: InfiniteBeachListProps) {
  const [beaches, setBeaches] = React.useState<BeachListItem[]>(initialBeaches)
  const [hasMore, setHasMore] = React.useState(initialHasMore)
  const [nextCursor, setNextCursor] = React.useState<string | null>(initialNextCursor)
  const [isLoading, setIsLoading] = React.useState(false)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "400px",
  })

  // Reset state when search params change (except for pagination)
  React.useEffect(() => {
    setBeaches(initialBeaches)
    setHasMore(initialHasMore)
    setNextCursor(initialNextCursor)
  }, [initialBeaches, initialHasMore, initialNextCursor])

  const loadMore = React.useCallback(async () => {
    if (isLoading || !hasMore || !nextCursor) return

    setIsLoading(true)
    try {
      let response: GetBeachesResponse
      
      if (searchParams.lat !== undefined && searchParams.lon !== undefined) {
        response = await getBeachesNearMe({
          lat: searchParams.lat,
          lon: searchParams.lon,
          limit: 12,
          offset: parseInt(nextCursor),
        })
      } else {
        response = await getBeaches({
          country: searchParams.country,
          vibe: searchParams.vibe,
          activity: searchParams.activity,
          crowd: searchParams.crowd,
          accessibility: searchParams.accessibility,
          limit: 12,
          cursor: nextCursor,
        })
      }

      setBeaches((prev) => [...prev, ...response.beaches])
      setHasMore(response.hasMore)
      setNextCursor(response.nextCursor)
    } catch (error) {
      console.error("Error loading more beaches:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, nextCursor, searchParams])

  React.useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore()
    }
  }, [inView, hasMore, isLoading, loadMore])

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {beaches.map((beach) => (
          <BeachCard key={beach.id} beach={beach} />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {isLoading && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              <p className="text-sm font-medium text-slate-500">Finding more paradise...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
