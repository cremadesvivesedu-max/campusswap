import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  href?: string;
  tone?: "dark" | "light";
  className?: string;
  imageClassName?: string;
  label?: string;
}

export function BrandLogo({
  href = "/",
  tone = "dark",
  className,
  imageClassName,
  label = "CampusSwap home"
}: BrandLogoProps) {
  const src =
    tone === "light"
      ? "/brand/campusswap-logo-light.svg"
      : "/brand/campusswap-logo-dark.svg";

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center", className)}
      aria-label={label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="CampusSwap"
        className={cn("h-10 w-auto", imageClassName)}
      />
    </Link>
  );
}
