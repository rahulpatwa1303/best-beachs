"use client"

import { useState, useEffect } from "react"
import { getBeachVibeSummary } from "@/actions/ai"
import ReactMarkdown from 'react-markdown'

interface VibeSummaryProps {
  beachName: string
  description: string
  vibes: string[]
}

export function VibeSummary({ beachName, description, vibes }: VibeSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await getBeachVibeSummary(beachName, description, vibes)
        setSummary(res)
      } catch (error) {
        console.error("Failed to fetch vibe summary:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSummary()
  }, [beachName, description, vibes])

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-slate-500 animate-pulse">
        <div className="h-4 w-4 rounded-full bg-rose-200" />
        <span className="text-sm font-medium italic">The Scout is checking the vibes...</span>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-rose-500 dark:prose-strong:text-rose-400 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:font-medium prose-p:italic">
      <ReactMarkdown>
        {summary}
      </ReactMarkdown>
    </div>
  )
}
