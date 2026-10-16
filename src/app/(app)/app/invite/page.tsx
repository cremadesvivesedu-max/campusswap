import { Trophy } from "lucide-react";
import { InviteShare } from "@/components/marketplace/invite-share";
import { referralCodeFor } from "@/features/referrals/code";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site-url";
import { getCurrentUser } from "@/server/queries/marketplace";
import { getInviteStats } from "@/server/queries/referrals";

export default async function InvitePage() {
  const user = await getCurrentUser();
  const [dictionary, stats] = await Promise.all([getDictionaryForRequest(), getInviteStats(user.id)]);
  const copy = dictionary.invite;
  const link = `${getSiteUrl()}/signup?ref=${referralCodeFor(user.id)}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-950">{copy.title}</h1>
        <p className="text-sm text-slate-600">{copy.subtitle}</p>
      </div>

      <section className="space-y-3 rounded-3xl bg-white p-5">
        <p className="font-bold text-slate-950">{copy.yourLink}</p>
        <InviteShare link={link} />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">{copy.invitedTotal}</p>
          <p className="text-3xl font-extrabold text-slate-950">{stats.invitedTotal}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">{copy.invitedMonth}</p>
          <p className="text-3xl font-extrabold text-slate-950">{stats.invitedThisMonth}</p>
          {stats.rank ? <p className="text-xs text-emerald-700">{copy.rank.replace("{rank}", String(stats.rank))}</p> : null}
        </div>
      </section>

      <section className="space-y-3 rounded-3xl bg-white p-5">
        <h2 className="flex items-center gap-2 font-bold text-slate-950">
          <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
          {copy.leaderboard}
        </h2>
        {stats.leaderboard.length ? (
          <ol className="divide-y divide-slate-100">
            {stats.leaderboard.map((entry, index) => (
              <li
                key={entry.userId}
                className={`flex items-center gap-3 py-2.5 text-sm ${entry.userId === user.id ? "font-bold text-emerald-800" : "text-slate-700"}`}
              >
                <span className="w-6 text-right tabular-nums text-slate-400">{index + 1}</span>
                <span className="flex-1">
                  {entry.name}
                  {entry.userId === user.id ? ` (${copy.you})` : ""}
                </span>
                <span className="tabular-nums">{entry.count}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">{copy.empty}</p>
        )}
      </section>
    </div>
  );
}
