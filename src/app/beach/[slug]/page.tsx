import { getBeachBySlug } from "@/actions/beaches"
import { MasonryGallery } from "@/components/MasonryGallery"
import { BeachCard } from "@/components/BeachCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ArrowLeft, Heart, MapPin, Share2, Star, Users, Wind, ShieldCheck, Calendar, Sparkles } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { toggleFavorite } from "@/actions/favorites"
import { ThemeToggle } from "@/components/ThemeToggle"
import { WeatherWidget } from "@/components/WeatherWidget"
import { VibeSummary } from "@/components/VibeSummary"
import { ShareButton } from "@/components/ShareButton"

import { Metadata } from "next"

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { beach } = await getBeachBySlug(slug)

  if (!beach) {
    return {
      title: "Beach Not Found",
    }
  }

  const description = beach.shortDescription || beach.description?.slice(0, 160) || `Discover ${beach.name} in ${beach.country}.`
  const ogImage = beach.photos[0]?.url || "https://best-beachs.vercel.app/og-image.png"

  return {
    title: beach.name,
    description: description,
    openGraph: {
      title: `${beach.name} | BeachSeeker`,
      description: description,
      url: `https://best-beachs.vercel.app/beach/${beach.slug}`,
      siteName: "BeachSeeker",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: beach.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${beach.name} | BeachSeeker`,
      description: description,
      images: [ogImage],
    },
  }
}

export default async function BeachDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { beach, similarBeaches } = await getBeachBySlug(slug)

  if (!beach) {
    notFound()
  }

  const mainPhoto = beach.photos[0]
  const otherPhotos = beach.photos.slice(1, 5)

  // Fetch weather data (Server-side)
  let weatherData = null
  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${beach.coordinates.lat}&longitude=${beach.coordinates.lon}&current_weather=true`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    if (weatherRes.ok) {
      const data = await weatherRes.json()
      weatherData = data.current_weather
    }
  } catch (error) {
    console.error("Failed to fetch weather:", error)
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${beach.coordinates.lat},${beach.coordinates.lon}`
  const planTripUrl = `https://www.google.com/search?q=plan+trip+to+${encodeURIComponent(beach.name)}+${encodeURIComponent(beach.country)}`

  const getCrowdDescription = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'Peaceful and secluded, perfect for a quiet getaway.'
      case 'high': return 'Vibrant and lively, great for socializing.'
      default: return 'A balanced atmosphere, not too crowded but with a nice buzz.'
    }
  }

  const getAccessibilityDescription = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'Well-maintained paths and easy parking available.'
      case 'moderate': return 'Requires a short walk or some stairs to reach.'
      case 'difficult': return 'Involves a hike or steep terrain, best for adventurers.'
      default: return 'Standard access with clear paths to the shore.'
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md dark:border-slate-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-slate-100 hover:text-rose-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ShareButton 
              title={beach.name}
              text={`Check out ${beach.name} on BeachSeeker!`}
              url={`https://best-beachs.vercel.app/beach/${beach.slug}`}
            />
            <form action={async () => {
              "use server"
              await toggleFavorite(beach.id)
            }}>
              <Button 
                type="submit"
                variant="ghost" 
                size="sm" 
                className={cn(
                  "gap-2 rounded-lg text-slate-600 dark:text-slate-400",
                  beach.isFavorite && "text-rose-500"
                )}
              >
                <Heart className={cn("h-4 w-4", beach.isFavorite && "fill-current")} />
                <span className="hidden sm:inline">{beach.isFavorite ? 'Saved' : 'Save'}</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {beach.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-slate-900 dark:text-white" />
              <span className="text-slate-900 dark:text-white">{beach.rating || '0.0'}</span>
              <span className="mx-1">·</span>
              <span className="underline cursor-pointer">{beach.reviewCount || 0} reviews</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verified Destination</span>
            </div>
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 underline hover:text-rose-500 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span>{beach.region}, {beach.country}</span>
            </a>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="mb-12 grid h-[400px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[500px]">
          <div className="col-span-4 row-span-1 overflow-hidden sm:col-span-2 sm:row-span-2">
            {mainPhoto && (
              <img
                src={mainPhoto.url}
                alt={beach.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer"
              />
            )}
          </div>
          {otherPhotos.map((photo, i) => (
            <div key={photo.id} className={cn(
              "hidden overflow-hidden sm:block",
              i === 0 && "col-span-1 row-span-1",
              i === 1 && "col-span-1 row-span-1",
              i === 2 && "col-span-1 row-span-1",
              i === 3 && "col-span-1 row-span-1"
            )}>
              <img
                src={photo.url}
                alt={`${beach.name} photo ${i + 2}`}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div className="grid gap-16 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-10">
            {/* Highlights */}
            <section className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Crowd Level: {beach.crowdLevel || 'Moderate'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{getCrowdDescription(beach.crowdLevel)}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                  <Wind className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Accessibility: {beach.accessibility || 'Easy'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{getAccessibilityDescription(beach.accessibility)}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Best time to visit</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {beach.bestMonths.length > 0 
                      ? beach.bestMonths.map(m => new Date(0, m - 1).toLocaleString('default', { month: 'long' })).join(', ')
                      : 'All year round'}
                  </p>
                </div>
              </div>
            </section>

            <Separator className="dark:bg-slate-800" />

            {/* Description */}
            <section>
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-500" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">The Vibe Check</h2>
              </div>
              <div className="mb-8 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 p-6 border border-rose-100 dark:border-rose-900/30">
                <VibeSummary beachName={beach.name} description={beach.description || ''} vibes={beach.vibes} />
              </div>

              <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">About this paradise</h2>
              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                {beach.description}
              </p>
            </section>

            <Separator className="dark:bg-slate-800" />

            {/* Activities & Facilities */}
            <section className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">What this place offers</h3>
                <ul className="space-y-3">
                  {beach.activities.map((activity) => (
                    <li key={activity} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Facilities</h3>
                <ul className="space-y-3">
                  {beach.facilities.map((facility) => (
                    <li key={facility} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      {facility}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Sidebar (Simplified Card) */}
          <div className="relative">
            <div className="sticky top-28 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{beach.entryFee || 'Free'}</span>
                  {!beach.entryFee && <span className="text-slate-500 dark:text-slate-400"> / entry</span>}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Star className="h-4 w-4 fill-current text-slate-900 dark:text-white" />
                  <span className="text-slate-900 dark:text-white">{beach.rating || '0.0'}</span>
                  <span className="text-slate-400">({beach.reviewCount || 0})</span>
                </div>
              </div>

              {/* Weather Widget */}
              {weatherData && <WeatherWidget data={weatherData} />}

              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Best Months</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {beach.bestMonths.length > 0 
                          ? beach.bestMonths.map(m => new Date(0, m - 1).toLocaleString('default', { month: 'short' })).join(', ')
                          : 'Year round'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Crowd Level</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{beach.crowdLevel || 'Moderate'}</p>
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full h-12 rounded-xl bg-rose-500 text-lg font-semibold hover:bg-rose-600 text-white">
                  <a href={planTripUrl} target="_blank" rel="noopener noreferrer">
                    Plan Your Visit
                  </a>
                </Button>
                
                <Button asChild variant="outline" className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900">
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Beaches */}
        {similarBeaches.length > 0 && (
          <section className="mt-20 border-t pt-16">
            <h2 className="mb-8 text-2xl font-semibold text-slate-900 dark:text-white">More beaches to explore</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {similarBeaches.map((similar) => (
                <BeachCard key={similar.id} beach={similar as any} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
