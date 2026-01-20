"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Photo } from "@/lib/schemas"

interface BeachPhotoCarouselProps {
    photos: Photo[]
    beachName: string
}

export function BeachPhotoCarousel({ photos, beachName }: BeachPhotoCarouselProps) {
    return (
        <Carousel
            className="w-full"
            plugins={[
                Autoplay({
                    delay: 4000,
                }),
            ]}
            opts={{
                loop: true,
            }}
        >
            <CarouselContent>
                {photos.map((photo, index) => (
                    <CarouselItem key={photo.id}>
                        <div className="h-[300px] w-full overflow-hidden rounded-xl">
                            <img
                                src={photo.url}
                                alt={`${beachName} photo ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="hidden">
                <CarouselPrevious />
                <CarouselNext />
            </div>
        </Carousel>
    )
}
