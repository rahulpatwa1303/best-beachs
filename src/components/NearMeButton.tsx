"use client"

import * as React from "react"
import { MapPin, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function NearMeButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLocating, setIsLocating] = React.useState(false)

  const isNearMeActive = searchParams.has("lat") && searchParams.has("lon")

  const handleNearMe = () => {
    if (isNearMeActive) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("lat")
      params.delete("lon")
      router.push(`/?${params.toString()}`)
      return
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const params = new URLSearchParams(searchParams.toString())
        params.set("lat", latitude.toString())
        params.set("lon", longitude.toString())
        // Clear other filters when searching near me? 
        // Or keep them? Let's clear them for a fresh "near me" search.
        params.delete("country")
        params.delete("vibe")
        params.delete("activity")

        router.push(`/?${params.toString()}`)
        setIsLocating(false)
        toast.success("Finding beaches near you!")
      },
      (error) => {
        setIsLocating(false)
        console.error("Geolocation error:", error)
        toast.error("Unable to retrieve your location")
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }

  return (
    <Button
      variant={isNearMeActive ? "default" : "outline"}
      size="sm"
      className="h-10 gap-2 rounded-xl border-slate-200 dark:border-slate-800 px-4 text-xs font-medium shadow-none"
      onClick={handleNearMe}
      disabled={isLocating}
    >
      {isLocating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <MapPin className={isNearMeActive ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5"} />
      )}
      {isNearMeActive ? "Near Me" : "Near Me"}
    </Button>
  )
}
