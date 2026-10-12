"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, MessageCircle, Plus, Search } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function MobileAppNav() {
  const pathname = usePathname();
  const { dictionary } = useLocale();

  // Conversations use the full screen height for the composer.
  if (pathname.startsWith("/app/messages/")) {
    return null;
  }

  const items = [
    { href: "/app", label: dictionary.nav.app.home, icon: Home },
    { href: "/app/search", label: dictionary.nav.app.search, icon: Search },
    { href: "/app/sell", label: dictionary.site.sellItem, icon: Plus, primary: true },
    { href: "/app/saved", label: dictionary.nav.app.saved, icon: Heart },
    { href: "/app/messages", label: dictionary.nav.app.messages, icon: MessageCircle }
  ];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const active =
            item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium transition",
                  active ? "text-slate-950" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {item.primary ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)]">
                    <item.icon className="h-5 w-5" />
                  </span>
                ) : (
                  <item.icon className={cn("h-6 w-6", active && "stroke-[2.4]")} />
                )}
                <span className={cn("max-w-full truncate", item.primary && "sr-only")}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
