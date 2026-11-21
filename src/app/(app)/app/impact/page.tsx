import Link from "next/link";
import { Leaf } from "lucide-react";
import { AmbassadorCard } from "@/components/marketplace/ambassador-card";
import { co2AsCarKm, residenceName } from "@/features/impact/seller-tools";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getCurrentUser } from "@/server/queries/marketplace";
import { getAmbassadors, getMyImpact, getResidenceRanking } from "@/server/queries/campus-impact";
import { getInviteStats } from "@/server/queries/referrals";

export const metadata = { title: "Impact" };

export default async function ImpactPage() {
  const user = await getCurrentUser();
  const [dictionary, impact, ranking, ambassadors, invites] = await Promise.all([
    getDictionaryForRequest(),
    getMyImpact(user.id),
    getResidenceRanking(),
    getAmbassadors(),
    getInviteStats(user.id)
  ]);
  const copy = dictionary.innov.impact;
  const best = ranking[0]?.kg ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-950">
          <Leaf className="h-6 w-6 text-emerald-600" aria-hidden="true" /> {copy.title}
        </h1>
        <p className="text-sm text-slate-600">{copy.subtitle}</p>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-3xl font-extrabold text-emerald-700">{impact.kg}</p>
          <p className="text-xs font-semibold text-slate-500">{copy.yourKg}</p>
          {impact.kg ? <p className="mt-1 text-xs text-slate-500">{copy.carKm.replace("{km}", String(co2AsCarKm(impact.kg)))}</p> : null}
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-3xl font-extrabold text-slate-950">{impact.items}</p>
          <p className="text-xs font-semibold text-slate-500">{copy.yourItems}</p>
        </div>
      </section>

      <section className="space-y-3 rounded-3xl bg-white p-5">
        <h2 className="font-bold text-slate-950">{copy.rankingTitle}</h2>
        {ranking.length ? (
          <ol className="space-y-3">
            {ranking.slice(0, 8).map((row, index) => (
              <li key={row.residence} className={row.residence === impact.residence ? "font-semibold" : ""}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-slate-900">
                    {index + 1}. {residenceName(row.residence)}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {row.kg} kg · {copy.items.replace("{count}", String(row.items))}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${best ? (row.kg / best) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">{copy.rankingEmpty}</p>
        )}
        {!impact.residence ? (
          <p className="text-xs text-slate-500">
            <Link href="/app/settings" className="font-semibold text-emerald-700 hover:underline">
              {copy.setResidence}
            </Link>
          </p>
        ) : null}
      </section>

      <AmbassadorCard dictionary={dictionary} invites={invites.invitedTotal} ambassadors={ambassadors} />
    </div>
  );
}
