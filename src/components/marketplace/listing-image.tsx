"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const fallbackImageSrc = "/demo/listings/listing-placeholder.svg";

interface ListingImageProps {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ListingImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  priority = false
}: ListingImageProps) {
  const safeSource = src?.trim() ? src : fallbackImageSrc;
  const [currentSrc, setCurrentSrc] = useState(safeSource);

  useEffect(() => {
    setCurrentSrc(safeSource);
  }, [safeSource]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-slate-100", className)}>
      <Image
        src={currentSrc}
        alt={alt}
        fill
        priority={priority}
        quality={72}
        sizes={sizes}
        className="object-cover"
        onError={() => {
          if (currentSrc !== fallbackImageSrc) {
            setCurrentSrc(fallbackImageSrc);
          }
        }}
      />
    </div>
  );
}
