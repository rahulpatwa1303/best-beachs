"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Check, 
  SlidersHorizontal, 
  Waves, 
  Sun, 
  Palmtree, 
  Umbrella, 
  Compass, 
  Anchor, 
  Fish, 
  Mountain, 
  Camera, 
  Ship, 
  Wind, 
  Bird, 
  LayoutGrid,
  Music,
  Flame,
  Footprints,
  Search,
  Trophy,
  Activity,
  Beer,
  Tent,
  Utensils,
  Map,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { FilterOptions } from '@/lib/schemas'

interface FilterBarProps {
  options: FilterOptions
}

const activityIcons: Record<string, any> = {
  'surf': Wind,
  'swim': Waves,
  'snorkeling': Anchor,
  'hiking': Mountain,
  'sunbathing': Sun,
  'volleyball': Activity,
  'soccer': Trophy,
  'diving': Anchor,
  'sailing': Ship,
  'fishing': Fish,
  'photo': Camera,
  'sightseeing': Camera,
  'bird': Bird,
  'boat': Ship,
  'club': Music,
  'fire': Flame,
  'walk': Footprints,
  'combing': Search,
  'body': Waves,
  'adventure': Compass,
  'food': Utensils,
  'camping': Tent,
  'bar': Beer,
  'map': Map,
}

function getActivityIcon(activity: string) {
  const lowerActivity = activity.toLowerCase()
  for (const [key, icon] of Object.entries(activityIcons)) {
    if (lowerActivity.includes(key)) {
      return icon
    }
  }
  return Waves
}

export function FilterBar({ options }: FilterBarProps) {
  const { countries, vibes, activities } = options
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCountry = searchParams.get('country')
  const currentVibe = searchParams.get('vibe')
  const currentActivity = searchParams.get('activity')
  const currentCrowd = searchParams.get('crowd')
  const currentAccessibility = searchParams.get('accessibility')

  const handleFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (!value || params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    router.push('/', { scroll: false })
  }

  const activeFiltersCount = [currentCountry, currentVibe, currentCrowd, currentAccessibility].filter(Boolean).length

  const activeFilters = [
    { key: 'country', value: currentCountry, label: 'Country' },
    { key: 'vibe', value: currentVibe, label: 'Vibe' },
    { key: 'activity', value: currentActivity, label: 'Activity' },
    { key: 'crowd', value: currentCrowd, label: 'Crowd' },
    { key: 'accessibility', value: currentAccessibility, label: 'Accessibility' },
  ].filter(f => f.value)

  return (
    <div className="sticky top-0 z-30 w-full bg-background/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="border-b dark:border-slate-800">
        <div className="container mx-auto flex h-20 items-center gap-6 px-4">
          {/* Categories Scroller (Activities) */}
          <ScrollArea className="flex-1 whitespace-nowrap">
            <div className="flex w-max space-x-8 py-2">
              {/* All Button */}
              <button
                onClick={() => handleFilter('activity', null)}
                className={cn(
                  "group flex flex-col items-center gap-2 border-b-2 pb-2 transition-all hover:border-slate-300 dark:hover:border-slate-700",
                  !currentActivity 
                    ? "border-slate-900 dark:border-white text-slate-900 dark:text-white" 
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                <LayoutGrid className={cn(
                  "h-6 w-6 transition-transform group-active:scale-90",
                  !currentActivity ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                )} />
                <span className="text-xs font-medium">All</span>
              </button>

              {activities.map((activity) => {
                const Icon = getActivityIcon(activity)
                const isActive = currentActivity === activity
                return (
                  <button
                    key={activity}
                    onClick={() => handleFilter('activity', activity)}
                    className={cn(
                      "group flex flex-col items-center gap-2 border-b-2 pb-2 transition-all hover:border-slate-300 dark:hover:border-slate-700",
                      isActive 
                        ? "border-slate-900 dark:border-white text-slate-900 dark:text-white" 
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon className={cn(
                      "h-6 w-6 transition-transform group-active:scale-90",
                      isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                    )} />
                    <span className="text-xs font-medium">{activity}</span>
                  </button>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>

          {/* Filter Trigger */}
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-2 rounded-xl border-slate-200 dark:border-slate-800 px-4 text-xs font-medium shadow-none hover:bg-slate-50 dark:hover:bg-slate-900">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-[10px] text-white dark:text-slate-900">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl p-0 overflow-hidden dark:bg-slate-950 dark:border-slate-800">
                <DialogHeader className="px-6 py-4 border-b dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-base font-bold dark:text-white">Filters</DialogTitle>
                  </div>
                </DialogHeader>
                
                <ScrollArea className="max-h-[70vh]">
                  <div className="p-6 space-y-8">
                    {/* Country Filter */}
                    <section className="space-y-4">
                      <h4 className="text-lg font-semibold dark:text-white">Country</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {countries.map((country) => (
                          <button
                            key={country}
                            onClick={() => handleFilter('country', country)}
                            className={cn(
                              "flex items-center justify-center rounded-xl border py-3 px-4 text-sm transition-all",
                              currentCountry === country 
                                ? "border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold" 
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white dark:text-slate-400"
                            )}
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    </section>

                    <Separator className="dark:bg-slate-800" />

                    {/* Vibe Filter */}
                    <section className="space-y-4">
                      <h4 className="text-lg font-semibold dark:text-white">Atmosphere & Vibe</h4>
                      <div className="flex flex-wrap gap-2">
                        {vibes.map((vibe) => (
                          <button
                            key={vibe}
                            onClick={() => handleFilter('vibe', vibe)}
                            className={cn(
                              "px-4 py-2 rounded-full border text-sm transition-all",
                              currentVibe === vibe 
                                ? "border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold" 
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white dark:text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {vibe}
                          </button>
                        ))}
                      </div>
                    </section>

                    <Separator className="dark:bg-slate-800" />

                    {/* Crowd Level */}
                    <section className="space-y-4">
                      <h4 className="text-lg font-semibold dark:text-white">Crowd Level</h4>
                      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                        {['Low', 'Moderate', 'High'].map((level) => (
                          <button
                            key={level}
                            onClick={() => handleFilter('crowd', level)}
                            className={cn(
                              "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                              currentCrowd === level 
                                ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" 
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </section>

                    <Separator className="dark:bg-slate-800" />

                    {/* Accessibility */}
                    <section className="space-y-4">
                      <h4 className="text-lg font-semibold dark:text-white">Accessibility</h4>
                      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                        {['Easy', 'Moderate', 'Difficult'].map((level) => (
                          <button
                            key={level}
                            onClick={() => handleFilter('accessibility', level)}
                            className={cn(
                              "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                              currentAccessibility === level 
                                ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white" 
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </ScrollArea>

                <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between bg-background dark:bg-slate-950">
                  <button 
                    onClick={clearFilters}
                    className="text-sm font-semibold underline underline-offset-4 hover:text-slate-600 dark:hover:text-slate-300 dark:text-white"
                  >
                    Clear all
                  </button>
                  <DialogClose asChild>
                    <Button className="rounded-xl px-8 h-12 font-bold bg-slate-900 dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200">
                      Show results
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFilters.length > 0 && (
        <div className="border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mr-2">
                Active Filters:
              </span>
              {activeFilters.map((filter) => (
                <Badge
                  key={`${filter.key}-${filter.value}`}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 gap-1 rounded-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                >
                  <span className="opacity-60">{filter.label}:</span>
                  {filter.value}
                  <button
                    onClick={() => handleFilter(filter.key, null)}
                    className="ml-1 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <button
                onClick={clearFilters}
                className="ml-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
