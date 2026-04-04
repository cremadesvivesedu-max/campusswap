import Link from "next/link";
import { publicNav } from "@/lib/constants";
import { getDictionaryForRequest } from "@/lib/i18n";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const dictionary = await getDictionaryForRequest();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
        <BrandLogo href="/" tone="light" imageClassName="h-9 sm:h-10" />
        <nav className="hidden items-center gap-6 md:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-200 transition hover:text-white"
            >
              {dictionary.nav.public[item.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher tone="light" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">{dictionary.site.logIn}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">{dictionary.site.sellItem}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
