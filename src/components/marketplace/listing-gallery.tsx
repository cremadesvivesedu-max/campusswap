"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { ListingImage } from "@/components/marketplace/listing-image";
import { cn } from "@/lib/utils";
import type { ListingImage as ListingImageType } from "@/types/domain";

interface ListingGalleryProps {
  images: ListingImageType[];
  title: string;
  className?: string;
}

// Swipeable photo strip (scroll-snap), like marketplace apps: swipe on phones, arrows
// on desktop, dots show where you are.
export function ListingGallery({ images, title, className }: ListingGalleryProps) {
  const { dictionary } = useLocale();
  const galleryImages = images.length
    ? images
    : [{ id: "fallback", url: undefined, alt: title, isPrimary: true }];
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const canBrowse = galleryImages.length > 1;

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const next = (index + galleryImages.length) % galleryImages.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        onScroll={(event) => {
          const track = event.currentTarget;
          setActiveIndex(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)));
        }}
        className="flex aspect-square snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-3xl bg-slate-100 [scrollbar-width:none] sm:aspect-[4/3] [&::-webkit-scrollbar]:hidden"
        aria-label={title}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") goTo(activeIndex + 1);
          if (event.key === "ArrowLeft") goTo(activeIndex - 1);
        }}
      >
        {galleryImages.map((image, index) => (
          <div key={image.id} className="relative h-full w-full shrink-0 snap-center">
            <ListingImage
              src={image.url}
              alt={image.alt ?? title}
              className="h-full w-full"
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
        ))}
      </div>

      {canBrowse ? (
        <>
          <span className="absolute right-3 top-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-white">
            {activeIndex + 1}/{galleryImages.length}
          </span>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
            {galleryImages.map((image, index) => (
              <span
                key={image.id}
                className={cn(
                  "h-1.5 rounded-full bg-white/90 shadow transition-all",
                  index === activeIndex ? "w-5" : "w-1.5 opacity-60"
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label={`${dictionary.common.actions.viewListing}: previous photo`}
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label={`${dictionary.common.actions.viewListing}: next photo`}
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
