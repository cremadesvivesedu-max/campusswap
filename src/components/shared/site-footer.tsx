import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/trust-safety", label: "Trust & Safety" },
  { href: "/join", label: "Join" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <BrandLogo href="/" tone="dark" imageClassName="h-9" />
          <p>Student-first resale, built for Maastricht.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
