import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/shared/brand-logo";
import { getDictionaryForRequest } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const dictionary = await getDictionaryForRequest();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),rgba(247,244,238,1)_42%,rgba(242,237,228,1)_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <aside className="hidden min-h-[40rem] flex-col justify-between rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.25),transparent_35%),linear-gradient(145deg,#020617,#0f172a_60%,#111827)] p-10 text-white shadow-[0_32px_90px_rgba(15,23,42,0.24)] lg:flex">
          <div className="space-y-10">
            <BrandLogo href="/" tone="light" imageClassName="h-10" />
            <div className="space-y-6">
              <Badge className="border-white/15 bg-white/10 text-white shadow-none">
                {dictionary.marketing.home.heroBadge}
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-lg font-display text-4xl font-semibold tracking-tight">
                  {dictionary.site.publicTagline}
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-300">
                  {dictionary.marketing.home.heroBody}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {dictionary.marketing.home.valueCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-4"
              >
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                  {card.eyebrow}
                </p>
                <p className="mt-2 font-display text-xl font-semibold text-white">
                  {card.title}
                </p>
              </div>
            ))}
          </div>
        </aside>
        <div className="flex items-center">
          <div className="w-full rounded-[40px] border border-white/70 bg-white/75 p-2 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
