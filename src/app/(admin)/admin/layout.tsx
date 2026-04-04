import Link from "next/link";
import { adminNav } from "@/lib/constants";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getAdminUser } from "@/server/queries/admin";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [admin, dictionary] = await Promise.all([
    getAdminUser(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <BrandLogo href="/admin" tone="light" imageClassName="h-9 sm:h-10" />
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                {dictionary.site.adminLabel}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {dictionary.site.adminTagline}
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-300">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-white"
              >
                {dictionary.nav.admin[item.key]}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher tone="light" />
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm">
              {admin.profile.fullName}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
