"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { ListingImage } from "@/components/marketplace/listing-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ListingImage as ListingImageType } from "@/types/domain";

interface ListingGalleryProps {
  images: ListingImageType[];
  title: string;
  className?: string;
}

export function ListingGallery({
  images,
  title,
  className
}: ListingGalleryProps) {
  const { dictionary } = useLocale();
  const galleryImages = images.length
    ? images
    : [{ id: "fallback", url: undefined, alt: title, isPrimary: true }];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((currentIndex) =>
      Math.min(currentIndex, Math.max(galleryImages.length - 1, 0))
    );
  }, [galleryImages.length]);

  const activeImage = galleryImages[activeIndex];
  const canBrowse = galleryImages.length > 1;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-glow">
        <ListingImage
          src={activeImage?.url}
          alt={activeImage?.alt ?? title}
          className="h-full w-full"
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/25 to-transparent" />
        {canBrowse ? (
          <>
            <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {activeIndex + 1} / {galleryImages.length}
              </span>
            </div>
            <div className="absolute inset-y-0 left-0 flex items-center px-3">
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-11 rounded-full p-0 shadow-lg"
                onClick={() =>
                  setActiveIndex((currentIndex) =>
                    currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1
                  )
                }
                aria-label={`${dictionary.common.actions.viewListing}: previous image`}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center px-3">
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-11 rounded-full p-0 shadow-lg"
                onClick={() =>
                  setActiveIndex((currentIndex) =>
                    currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1
                  )
                }
                aria-label={`${dictionary.common.actions.viewListing}: next image`}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : null}
      </div>

      {canBrowse ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-[22px] border bg-white transition",
                activeIndex === index
                  ? "border-slate-950 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <ListingImage
                src={image.url}
                alt={image.alt}
                className="h-full w-full"
                sizes="180px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
