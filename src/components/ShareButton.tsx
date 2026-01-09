"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonProps {
  title: string
  text: string
  url: string
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error)
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
      } catch (error) {
        console.error("Error copying to clipboard:", error)
        toast.error("Failed to copy link.")
      }
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="gap-2 rounded-lg text-slate-600 dark:text-slate-400"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">Share</span>
    </Button>
  )
}
