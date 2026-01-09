"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Mail, Sparkles } from "lucide-react"
import { subscribe } from "@/actions/newsletter"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    
    const formData = new FormData()
    formData.append("email", email)
    
    const result = await subscribe(formData)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message)
      setEmail("")
    }
    
    setLoading(false)
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center text-white dark:bg-slate-900/50 sm:px-12 sm:py-24">
      {/* Decorative elements */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
      
      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-rose-400" />
          <span>Join the BeachSeeker community</span>
        </div>
        
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Find your next escape before anyone else
        </h2>
        <p className="mb-10 text-lg text-slate-300">
          Get weekly curated beach destinations, travel tips, and hidden gems delivered straight to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-rose-500"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="h-12 bg-rose-500 px-8 font-semibold text-white hover:bg-rose-600 sm:w-auto"
          >
            {loading ? "Joining..." : "Get Early Access"}
          </Button>
        </form>
        
        <p className="mt-4 text-sm text-slate-500">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  )
}
