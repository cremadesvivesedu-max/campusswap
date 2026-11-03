import Link from "next/link";
import { ChevronRight, Truck } from "lucide-react";
import { isMovingSeason } from "@/features/profile/moving-sale";

/** Only shows in the months when students move out. */
export function MovingSeasonBanner({ title, body }: { title: string; body: string }) {
  if (!isMovingSeason()) {
    return null;
  }

  return (
    <Link href="/moving-out" className="flex items-center gap-3 rounded-2xl bg-sky-100 p-4 text-sky-950">
      <Truck className="h-6 w-6 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold">{title}</span>
        <span className="block truncate text-sm">{body}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
    </Link>
  );
}
