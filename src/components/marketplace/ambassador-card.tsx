import { Award } from "lucide-react";
import { ambassadorLevel, invitesToNextLevel, residenceName } from "@/features/impact/seller-tools";
import type { Dictionary } from "@/lib/i18n-shared";
import type { AmbassadorRow } from "@/server/queries/campus-impact";

/** Your ambassador level and progress, plus the best ambassadors with their residence. */
export function AmbassadorCard({ dictionary, invites, ambassadors }: { dictionary: Dictionary; invites: number; ambassadors: AmbassadorRow[] }) {
  const copy = dictionary.innov.ambassador;
  const level = ambassadorLevel(invites);
  const next = invitesToNextLevel(invites);
  const levelName = (value: "gold" | "ambassador") => (value === "gold" ? copy.gold : copy.ambassador);

  return (
    <section className="space-y-3 rounded-3xl bg-white p-5">
      <h2 className="flex items-center gap-2 font-bold text-slate-950">
        <Award className="h-5 w-5 text-amber-600" aria-hidden="true" /> {copy.title}
      </h2>
      <p className="text-sm font-semibold text-slate-900">
        {level && !next
          ? copy.done.replace("{level}", levelName(level))
          : copy.progress
              .replace("{n}", String(next))
              .replace("{level}", levelName(invites >= 5 ? "gold" : "ambassador"))}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (invites / 15) * 100)}%` }} />
      </div>
      <p className="text-xs text-slate-500">{copy.perks}</p>
      <h3 className="pt-2 text-sm font-bold text-slate-950">{copy.rankingTitle}</h3>
      {ambassadors.length ? (
        <ol className="space-y-1.5 text-sm">
          {ambassadors.slice(0, 10).map((row, index) => (
            <li key={row.userId} className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-slate-800">
                {index + 1}. {row.name}
                {row.residence && row.residence !== "other" ? (
                  <span className="text-slate-500"> · {residenceName(row.residence)}</span>
                ) : null}
              </span>
              <span className="shrink-0 text-xs font-semibold text-slate-600">
                {row.level === "gold" ? "🥇" : "🏅"} {copy.invites.replace("{count}", String(row.invites))}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-slate-500">{copy.empty}</p>
      )}
    </section>
  );
}
