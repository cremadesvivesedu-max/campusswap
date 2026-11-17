import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DAC7_MAX_AMOUNT, DAC7_MAX_SALES } from "@/server/services/dac7";
import { getAdminDac7 } from "@/server/queries/admin";

const eur = (n: number) => `€${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const label = { reportable: "Must be reported", close: "Close: ask for tax details", exempt: "Exempt" } as const;
const tone = {
  reportable: "bg-rose-100 text-rose-800",
  close: "bg-amber-100 text-amber-800",
  exempt: "bg-slate-100 text-slate-600"
} as const;

export default async function AdminDac7Page({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const params = await searchParams;
  const thisYear = new Date().getUTCFullYear();
  const asked = Number(params.year);
  const year = Number.isInteger(asked) && asked >= 2024 && asked <= thisYear ? asked : thisYear;
  const rows = await getAdminDac7(year);
  const reportable = rows.filter((r) => r.status === "reportable").length;
  const close = rows.filter((r) => r.status === "close").length;

  return (
    <div className="space-y-4">
      <Card className="bg-white">
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold text-slate-950">DAC7 · sellers in {year}</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-7 text-slate-600">
          <p>
            Sellers with {DAC7_MAX_SALES} or more completed sales, or {eur(DAC7_MAX_AMOUNT)} or more in a calendar year, must be reported to the
            Belastingdienst by 31 January of the next year, with their tax number, date of birth and address. Everyone below both limits is
            excluded. Ask only those marked below for their details.
          </p>
          <p className="font-medium text-slate-900">
            {reportable} to report · {close} close to the limit · {rows.length} sellers with completed sales
          </p>
          <p>
            Other years:{" "}
            {[thisYear - 2, thisYear - 1, thisYear].map((y) => (
              <a key={y} href={`/admin/dac7?year=${y}`} className="mr-3 underline">
                {y}
              </a>
            ))}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-white">
        <CardContent className="overflow-x-auto p-4">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-600">No completed sales in {year}.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2">Seller</th>
                  <th>Sales</th>
                  <th>Received</th>
                  <th>Fees</th>
                  <th>By quarter (sales · €)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.sellerId} className="border-t border-slate-100 align-top">
                    <td className="py-2">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500">{row.email}</div>
                    </td>
                    <td>{row.sales}</td>
                    <td>{eur(row.consideration)}</td>
                    <td>{eur(row.fees)}</td>
                    <td className="text-xs text-slate-600">
                      {row.quarters.map((q, i) => `Q${i + 1}: ${q.sales} · ${eur(q.consideration)}`).join(" | ")}
                    </td>
                    <td>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone[row.status]}`}>{label[row.status]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
