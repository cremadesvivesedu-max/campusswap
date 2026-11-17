import { FUNNEL_STEPS, findFunnelDrops, rate, type FunnelWeek } from "@/features/funnel/funnel-alert";

function pct(value: number) {
  return `${(value * 100).toFixed(1)} %`;
}

export function FunnelTable({ weeks }: { weeks: FunnelWeek[] }) {
  if (!weeks.length) {
    return <p className="text-sm text-slate-500">Funnel data is not available yet (migration 0024).</p>;
  }
  const drops = findFunnelDrops(weeks);
  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-5">
      <h2 className="font-display text-xl font-semibold text-slate-950">Funnel: visit → sign-up → listing → sale</h2>
      {drops.length ? (
        <ul className="space-y-1 rounded-2xl bg-rose-50 p-3 text-sm text-rose-800">
          {drops.map((drop) => (
            <li key={drop.step}>
              ⚠️ {drop.label}: {pct(drop.current)} last week vs {pct(drop.baseline)} usual
            </li>
          ))}
        </ul>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2">Week</th>
              <th>Visits</th>
              <th>Sign-ups</th>
              <th>Listings</th>
              <th>Sales</th>
              {FUNNEL_STEPS.map((step) => (
                <th key={step.key}>{step.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, index) => (
              <tr key={week.weekStart} className="border-t border-slate-100">
                <td className="py-2">{week.weekStart.slice(0, 10)}{index === 0 ? " (now)" : ""}</td>
                <td>{week.visits}</td>
                <td>{week.signups}</td>
                <td>{week.listings}</td>
                <td>{week.sales}</td>
                {FUNNEL_STEPS.map((step) => (
                  <td key={step.key}>{pct(rate(week[step.to], week[step.from]))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
