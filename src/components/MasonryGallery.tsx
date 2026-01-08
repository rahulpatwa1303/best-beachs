"use client"

import { Photo } from '@/lib/schemas'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { DialogTitle } from '@radix-ui/react-dialog'

interface MasonryGalleryProps {
  photos: Photo[]
}

export function MasonryGallery({ photos }: MasonryGalleryProps) {
  if (!photos.length) return null

  // Simple masonry logic: split into 3 columns
  const columns: Photo[][] = [[], [], []]
  photos.forEach((photo, i) => {
    columns[i % 3].push(photo)
  })

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="grid gap-4">
          {column.map((photo) => (
            <Dialog key={photo.id}>
              <DialogTrigger asChild>
                <div className="group relative cursor-zoom-in overflow-hidden rounded-xl bg-muted">
                  <img
                    src={photo.thumbnail || photo.url}
                    alt={photo.photographer ? `Photo by ${photo.photographer}` : 'Beach photo'}
                    className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">Photo View</DialogTitle>
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={photo.url}
                    alt={photo.photographer ? `Photo by ${photo.photographer}` : 'Beach photo'}
                    className="h-auto w-full max-h-[85vh] object-contain"
                  />
                  {photo.photographer && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white backdrop-blur-sm">
                      <p className="text-sm">
                        Photo by{' '}
                        {photo.photographerUrl ? (
                          <a
                            href={photo.photographerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-emerald-300"
                          >
                            {photo.photographer}
                          </a>
                        ) : (
                          photo.photographer
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      ))}
    </div>
  )
}
