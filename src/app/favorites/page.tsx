import { getBeaches } from "@/actions/beaches"
import { BeachCard } from "@/components/BeachCard"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"

export const dynamic = 'force-dynamic'

export default async function Favorites() {
  const { beaches } = await getBeaches({ favoritesOnly: true, limit: 50 })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-950 dark:border-slate-800">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-rose-500">
            <img src="/beachatlas-logo.svg" alt="BeachAtlas" className="h-10 w-10" />
            <span className="text-xl font-bold tracking-tight dark:text-white">BeachAtlas</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Your Favorites</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">All the paradise spots you've saved for later.</p>
        </div>

        {beaches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
              <Heart className="h-12 w-12 text-slate-200 dark:text-slate-800" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">No favorites yet</h2>
            <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400 text-lg">
              When you find a beach you love, click the heart icon to save it here.
            </p>
            <Button asChild className="mt-8 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 px-8 py-6 text-lg hover:bg-slate-800 dark:hover:bg-slate-200">
              <Link href="/">Start exploring</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {beaches.map((beach) => (
              <BeachCard key={beach.id} beach={beach} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
