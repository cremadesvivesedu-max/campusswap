import Link from "next/link";
import { Menu } from "lucide-react";
import { publicNav } from "@/lib/constants";
import { getDictionaryForRequest } from "@/lib/i18n";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const dictionary = await getDictionaryForRequest();

  return (
    <header className="sticky top-0 z-40 border-b border-white/12 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 text-white sm:px-6 sm:py-4">
        <BrandLogo href="/" tone="light" imageClassName="h-9 sm:h-11" />
        <nav className="hidden items-center gap-1 rounded-full border border-white/12 bg-white/[0.07] p-1 lg:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              {dictionary.nav.public[item.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.07] p-1.5">
            <LanguageSwitcher tone="light" />
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden whitespace-nowrap text-white/90 hover:text-white sm:inline-flex"
            >
              <Link href="/login">{dictionary.site.logIn}</Link>
            </Button>
            <Button asChild size="sm" className="whitespace-nowrap">
              <Link href="/signup">{dictionary.site.sellItem}</Link>
            </Button>
          </div>
          <details className="group relative lg:hidden">
            <summary
              aria-label="Menu"
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/12 bg-white/[0.07] transition hover:bg-white/15 [&::-webkit-details-marker]:hidden"
            >
              <Menu className="h-5 w-5" />
            </summary>
            <nav className="absolute right-0 top-12 grid w-56 gap-1 rounded-3xl border border-white/12 bg-slate-950 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.45)]">
              {publicNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                >
                  {dictionary.nav.public[item.key]}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded-2xl px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white sm:hidden"
              >
                {dictionary.site.logIn}
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
