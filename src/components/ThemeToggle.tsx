"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-10 w-10" />
  }

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="h-10 w-[110px] rounded-xl border-slate-200 dark:border-slate-800 bg-transparent shadow-none focus:ring-0">
        <div className="flex items-center gap-2">
          {theme === "light" && <Sun className="h-4 w-4" />}
          {theme === "dark" && <Moon className="h-4 w-4" />}
          {theme === "system" && <div className="h-4 w-4 rounded-full border-2 border-slate-400" />}
          <span className="text-xs font-medium capitalize">{theme}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-slate-400" />
            <span>System</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
