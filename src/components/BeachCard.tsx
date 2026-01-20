"use client"

import Link from 'next/link'
import { Heart, MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BeachListItem } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { toggleFavorite } from '@/actions/favorites'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface BeachCardProps {
  beach: BeachListItem
  className?: string
}

export function BeachCard({ beach, className }: BeachCardProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(beach.isFavorite)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsFavorite(!isFavorite)
    setIsLoading(true)

    try {
      await toggleFavorite(beach.id)
      router.refresh()
    } catch (error) {
      setIsFavorite(!isFavorite)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("group flex flex-col gap-3", className)}>
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {beach.primaryPhoto ? (
          <img
            src={beach.primaryPhoto.thumbnail || beach.primaryPhoto.url}
            alt={beach.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className="absolute right-3 top-3 z-20 transition-transform active:scale-90"
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-colors",
              isFavorite ? "fill-rose-500 stroke-rose-500" : "fill-black/30 stroke-white stroke-[2px]"
            )}
          />
          <span className="sr-only">Save {beach.name}</span>
        </button>

        <Link
          href={`/beach/${beach.slug}?${new URLSearchParams(useSearchParams().toString()).toString()}`}
          className="absolute inset-0 z-10"
        >
          <span className="sr-only">View {beach.name}</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-slate-900 dark:text-white line-clamp-1">
            {beach.name}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-current text-slate-900 dark:text-white" />
            <span className="font-medium text-slate-900 dark:text-white">{beach.rating || '0.0'}</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
          {beach.region}, {beach.country}
          {beach.distance !== undefined && (
            <span className="ml-2 text-rose-500 font-medium">
              • {beach.distance} km away
            </span>
          )}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {beach.vibes.slice(0, 2).map((vibe) => (
            <span
              key={vibe}
              className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              {vibe}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
