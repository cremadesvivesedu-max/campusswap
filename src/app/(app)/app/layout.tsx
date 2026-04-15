import Link from "next/link";
import { appNav } from "@/lib/constants";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getCurrentUser } from "@/server/queries/marketplace";
import { BrandLogo } from "@/components/shared/brand-logo";
import { UserIdentityButton } from "@/components/shared/user-identity-button";
import { CurrentUserProvider } from "@/components/providers/current-user-provider";
import { VerificationPromptCard } from "@/components/shared/verification-prompt-card";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { FloatingSellButton } from "@/components/shared/floating-sell-button";
import { AppHeaderActivity } from "@/components/shared/app-header-activity";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, dictionary] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest()
  ]);

  return (
    <CurrentUserProvider user={user}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),rgba(247,244,238,1)_42%,rgba(243,238,229,1)_100%)]">
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f7f4ee]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <BrandLogo href="/app" tone="dark" imageClassName="h-9 sm:h-10" />
              <p className="text-sm text-slate-500">
                {dictionary.site.publicTagline}
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/75 p-1 text-sm text-slate-600 shadow-sm">
              {appNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-2 font-medium transition hover:bg-white hover:text-slate-950"
                >
                  {dictionary.nav.app[item.key]}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 p-1.5 shadow-sm">
              <LanguageSwitcher tone="dark" />
              <AppHeaderActivity />
              <UserIdentityButton user={user} />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-6 py-8 sm:py-10">
          <VerificationPromptCard user={user} />
          {children}
        </main>
        <FloatingSellButton />
      </div>
    </CurrentUserProvider>
  );
}
