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
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AppHeaderActivityShell } from "@/components/shared/app-header-activity-shell";
import { MobileAppNav } from "@/components/shared/mobile-app-nav";

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
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f7f4ee]/92 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <BrandLogo href="/app" tone="dark" imageClassName="h-8 sm:h-10" />
              <p className="hidden text-sm text-slate-500 sm:block">
                {dictionary.site.publicTagline}
              </p>
            </div>
            <nav className="-mx-1 hidden w-[calc(100%+0.5rem)] max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200/80 bg-white/75 p-1 text-xs text-slate-600 shadow-sm [scrollbar-width:none] sm:mx-0 sm:w-auto sm:text-sm sm:flex [&::-webkit-scrollbar]:hidden">
              {appNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full px-3 py-2 font-medium transition hover:bg-white hover:text-slate-950"
                >
                  {dictionary.nav.app[item.key]}
                </Link>
              ))}
            </nav>
            <div className="flex w-full items-center justify-between gap-2 rounded-full border border-slate-200/80 bg-white/75 p-1.5 shadow-sm sm:w-auto sm:justify-start">
              <LanguageSwitcher tone="dark" />
              <AppHeaderActivityShell />
              <UserIdentityButton user={user} />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 pb-28 pt-6 sm:px-6 sm:py-10">
          <VerificationPromptCard user={user} />
          {children}
        </main>
        <FloatingSellButton />
        <MobileAppNav />
        <InstallPrompt />
      </div>
    </CurrentUserProvider>
  );
}
