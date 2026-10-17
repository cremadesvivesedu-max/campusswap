import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { categoryLandings } from "@/features/seo/category-landings";

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refunds & disputes" },
  { href: "/contact", label: "Contact" },
  { href: "/trust-safety", label: "Trust & Safety" },
  { href: "/join", label: "Join" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 text-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <BrandLogo href="/" tone="light" imageClassName="h-9" />
          <p className="max-w-md leading-6 text-slate-400">
            Student-first resale, built for Maastricht.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      {/* Links Google can follow to the Maastricht pages. */}
      <nav className="mx-auto max-w-7xl px-6 pb-10 text-xs text-slate-400">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {categoryLandings.map((landing) => (
            <li key={landing.slug}>
              <Link href={`/maastricht/${landing.slug}`} className="hover:text-white">
                {landing.h1}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
