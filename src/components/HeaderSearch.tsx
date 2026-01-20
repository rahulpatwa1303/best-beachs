"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface HeaderSearchProps {
  countries: string[]
  vibes: string[]
}

export function HeaderSearch({ countries, vibes }: HeaderSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCountry = searchParams.get("country") || ""
  const currentVibe = searchParams.get("vibe") || ""

  const handleFilter = (key: "country" | "vibe", value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="hidden max-w-lg flex-1 px-8 md:block">
      <div className="flex h-12 items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-2 transition-all hover:bg-white dark:hover:bg-slate-900 group">
        <div className="flex flex-1 items-center text-sm font-medium">
          {/* Location Select */}
          <div className="flex-1">
            <Select
              value={currentCountry || "all"}
              onValueChange={(val) => handleFilter("country", val)}
            >
              <SelectTrigger className="h-10 border-0 bg-transparent shadow-none focus:ring-0 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors [&>svg]:hidden">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1">Location</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                    {currentCountry || "Find your coast"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                <SelectItem value="all">All Locations</SelectItem>
                {countries.filter(c => c && c.trim() !== "").map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Vibe Select */}
          <div className="flex-1">
            <Select
              value={currentVibe || "all"}
              onValueChange={(val) => handleFilter("vibe", val)}
            >
              <SelectTrigger className="h-10 border-0 bg-transparent shadow-none focus:ring-0 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors [&>svg]:hidden">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1">Atmosphere</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                    {currentVibe || "Select a vibe"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                <SelectItem value="all">All Vibes</SelectItem>
                {vibes.filter(v => v && v.trim() !== "").map((vibe) => (
                  <SelectItem key={vibe} value={vibe}>
                    {vibe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform shrink-0">
          <Search className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}
