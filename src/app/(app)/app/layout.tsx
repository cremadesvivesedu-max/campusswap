import Link from "next/link";
import { appNav } from "@/lib/constants";
import { getCurrentUser } from "@/server/queries/marketplace";
import { BrandLogo } from "@/components/shared/brand-logo";
import { UserIdentityButton } from "@/components/shared/user-identity-button";
import { CurrentUserProvider } from "@/components/providers/current-user-provider";
import { VerificationPromptCard } from "@/components/shared/verification-prompt-card";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <CurrentUserProvider user={user}>
      <div className="min-h-screen bg-[#f7f4ee]">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <BrandLogo href="/app" tone="dark" imageClassName="h-9 sm:h-10" />
              <p className="text-sm text-slate-500">
                Student-first marketplace for Maastricht
              </p>
            </div>
            <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
              {appNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <UserIdentityButton user={user} />
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-6 py-10">
          <VerificationPromptCard user={user} />
          {children}
        </main>
      </div>
    </CurrentUserProvider>
  );
}
