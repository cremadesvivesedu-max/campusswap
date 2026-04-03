"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  userId: string;
  name: string;
  src?: string;
  className?: string;
  imageClassName?: string;
}

export function ProfileAvatar({
  name,
  src,
  className,
  imageClassName
}: ProfileAvatarProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [name]
  );

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-700",
        className
      )}
    >
      {currentSrc ? (
        <Image
          src={currentSrc}
          alt={`${name} avatar`}
          fill
          sizes="96px"
          className={cn("object-cover", imageClassName)}
          onError={() => setCurrentSrc(undefined)}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}
