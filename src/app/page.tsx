import { getBeaches, getBeachesNearMe, getFilterOptions } from "@/actions/beaches"
import { BeachCard } from "@/components/BeachCard"
import { FilterBar } from "@/components/FilterBar"
import { Button } from "@/components/ui/button"
import { Heart, Search, User } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"
import { HeaderSearch } from "@/components/HeaderSearch"
import { Newsletter } from "@/components/Newsletter"
import { Suspense } from "react"
import { InfiniteBeachList } from "@/components/InfiniteBeachList"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const country = typeof params.country === 'string' ? params.country : undefined
  const vibe = typeof params.vibe === 'string' ? params.vibe : undefined
  const activity = typeof params.activity === 'string' ? params.activity : undefined
  const crowd = typeof params.crowd === 'string' ? params.crowd : undefined
  const accessibility = typeof params.accessibility === 'string' ? params.accessibility : undefined
  const lat = typeof params.lat === 'string' ? parseFloat(params.lat) : undefined
  const lon = typeof params.lon === 'string' ? parseFloat(params.lon) : undefined

  const [beachesData, filterOptions] = await Promise.all([
    lat !== undefined && lon !== undefined
      ? getBeachesNearMe({ lat, lon, limit: 20 })
      : getBeaches({ country, vibe, activity, crowd, accessibility, limit: 20 }),
    getFilterOptions()
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-950 dark:border-slate-800">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-rose-500">
            <img src="/beachatlas-logo.svg" alt="BeachAtlas" className="h-10 w-10" />
            <span className="text-xl font-bold tracking-tight dark:text-white">BeachAtlas</span>
          </Link>

          {/* Search Bar (Redesigned & Functional) */}
          <Suspense fallback={<div className="h-12 w-full max-w-md animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />}>
            <HeaderSearch
              countries={filterOptions.countries}
              vibes={filterOptions.vibes}
            />
          </Suspense>

          {/* User Menu & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/favorites"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 sm:w-auto sm:px-3 sm:py-2 sm:rounded-lg sm:hover:bg-slate-100 transition-colors group"
            >
              <Heart className="h-5 w-5 sm:hidden group-hover:text-rose-500 transition-colors" />
              <span className="hidden text-sm font-medium sm:block group-hover:text-slate-900 dark:group-hover:text-white">
                Favorites
              </span>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <Suspense fallback={<div className="h-20 w-full animate-pulse bg-slate-50 dark:bg-slate-900" />}>
        <FilterBar options={filterOptions} />
      </Suspense>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {beachesData.beaches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">No beaches found</h2>
            <p className="mt-2 text-slate-500">
              Try adjusting your filters to find what you're looking for.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-xl">
              <Link href="/">Clear all filters</Link>
            </Button>
          </div>
        ) : (
          <InfiniteBeachList
            initialBeaches={beachesData.beaches}
            initialHasMore={beachesData.hasMore}
            initialNextCursor={beachesData.nextCursor}
            searchParams={{
              country,
              vibe,
              activity,
              crowd,
              accessibility,
              lat,
              lon
            }}
          />
        )}
        <div className="container mx-auto px-4 mt-20">
          {/* <Newsletter /> */}
        </div>
      </main>

      {/* Footer (Simple) */}
      <footer className="mt-12 border-t bg-slate-50 dark:bg-slate-950 dark:border-slate-800 py-12">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© 2026 BeachAtlas.</p>
        </div>
      </footer>
    </div>
  )
}
