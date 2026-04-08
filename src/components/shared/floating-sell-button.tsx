"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

export function FloatingSellButton() {
  const pathname = usePathname();
  const { dictionary } = useLocale();

  if (
    pathname === "/app/sell" ||
    pathname.startsWith("/app/messages/")
  ) {
    return null;
  }

  return (
    <Link
      href="/app/sell"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      aria-label={dictionary.site.sellItem}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/12">
        <Plus className="h-4 w-4" />
      </span>
      <span className="hidden sm:inline">{dictionary.site.sellItem}</span>
    </Link>
  );
}
