import { formatChange, type WeekMetrics } from "@/server/services/weekly-metrics";

const rows: { key: keyof WeekMetrics; label: string; money?: boolean }[] = [
  { key: "newUsers", label: "Usuarios nuevos" },
  { key: "newListings", label: "Anuncios nuevos" },
  { key: "newChats", label: "Chats nuevos" },
  { key: "messages", label: "Mensajes" },
  { key: "sales", label: "Ventas" },
  { key: "salesVolume", label: "Volumen vendido", money: true },
  { key: "reviews", label: "Valoraciones" }
];

function weekLabel(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
}

function display(value: number, money?: boolean) {
  return money ? `€${value.toFixed(0)}` : String(value);
}

function changeTone(change: string) {
  if (change.startsWith("+") || change === "nuevo") return "text-emerald-700 bg-emerald-50";
  if (change.startsWith("-")) return "text-rose-700 bg-rose-50";
  return "text-slate-500 bg-slate-100";
}

/**
 * The Monday check-in: last full week against the week before, then the trend.
 * Weeks run Monday to Sunday (UTC); the first column is the week in progress.
 */
export function WeeklyMetrics({
  weeks,
  activeLast7Days,
  totalUsers
}: {
  weeks: WeekMetrics[];
  activeLast7Days: number;
  totalUsers: number;
}) {
  const [current, lastWeek, weekBefore] = weeks;

  if (!lastWeek || !weekBefore) {
    return null;
  }

  const highlights = [
    { label: "Usuarios nuevos", value: lastWeek.newUsers, previous: weekBefore.newUsers },
    { label: "Anuncios nuevos", value: lastWeek.newListings, previous: weekBefore.newListings },
    { label: "Chats nuevos", value: lastWeek.newChats, previous: weekBefore.newChats },
    { label: "Ventas", value: lastWeek.sales, previous: weekBefore.sales }
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">Métricas del lunes</h2>
          <p className="text-sm text-slate-500">
            Semana del {weekLabel(lastWeek.weekStart)} comparada con la anterior · {activeLast7Days} de{" "}
            {totalUsers} usuarios activos en los últimos 7 días
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {highlights.map((item) => {
          const change = formatChange(item.value, item.previous);
          return (
            <div key={item.label} className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">{item.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-950">{item.value}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${changeTone(change)}`}>
                  {change}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">antes: {item.previous}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-semibold">Semana</th>
              {weeks.map((week, index) => (
                <th key={week.weekStart} className="px-3 py-3 text-right font-semibold">
                  {weekLabel(week.weekStart)}
                  {index === 0 ? <span className="block font-normal text-slate-400">en curso</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2.5 font-medium text-slate-700">{row.label}</td>
                {weeks.map((week, index) => (
                  <td
                    key={week.weekStart}
                    className={`px-3 py-2.5 text-right tabular-nums ${index === 1 ? "font-bold text-slate-950" : "text-slate-600"}`}
                  >
                    {display(Number(week[row.key] ?? 0), row.money)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-4 py-2.5 font-medium text-slate-700">Nota media</td>
              {weeks.map((week) => (
                <td key={week.weekStart} className="px-3 py-2.5 text-right tabular-nums text-slate-600">
                  {week.averageRating ? `${week.averageRating}★` : "–"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {current ? (
        <p className="text-xs text-slate-400">
          Esta semana va por: {current.newUsers} usuarios, {current.newListings} anuncios, {current.newChats} chats y{" "}
          {current.sales} ventas.
        </p>
      ) : null}
    </section>
  );
}
