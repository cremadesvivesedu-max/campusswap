/**
 * DAC7 (Council Directive (EU) 2021/514; in the Netherlands, Wet implementatie DAC7): platform operators report sellers
 * to the tax office once a year. A seller of goods is excluded when, in the calendar year, they made fewer than
 * 30 sales AND received less than EUR 2,000 in total. Everyone else is "reportable" and we need their tax details
 * (TIN, date of birth, address) before 31 January of the following year.
 *
 * This only counts what the marketplace already knows (completed transactions). It never asks sellers for tax data:
 * that is collected only from sellers who cross, or come close to, the threshold.
 */
export const DAC7_MAX_SALES = 30;
export const DAC7_MAX_AMOUNT = 2000;
/** Ask for tax details a little before the threshold so it is ready in January. */
export const DAC7_WARNING_SHARE = 0.75;

export type Dac7Sale = {
  sellerId: string;
  completedAt: string;
  amount: number;
  platformFee: number;
};

export type Dac7Status = "exempt" | "close" | "reportable";

export type Dac7SellerYear = {
  sellerId: string;
  year: number;
  sales: number;
  consideration: number;
  fees: number;
  /** Per quarter Q1..Q4, as DAC7 reports them. */
  quarters: { sales: number; consideration: number; fees: number }[];
  status: Dac7Status;
};

const round = (n: number) => Math.round(n * 100) / 100;

export function dac7Status(sales: number, consideration: number): Dac7Status {
  if (sales >= DAC7_MAX_SALES || consideration >= DAC7_MAX_AMOUNT) {
    return "reportable";
  }
  if (sales >= DAC7_MAX_SALES * DAC7_WARNING_SHARE || consideration >= DAC7_MAX_AMOUNT * DAC7_WARNING_SHARE) {
    return "close";
  }
  return "exempt";
}

/** Groups completed sales by seller for one calendar year (UTC), biggest sellers first. */
export function summarizeDac7(sales: Dac7Sale[], year: number): Dac7SellerYear[] {
  const bySeller = new Map<string, Dac7SellerYear>();
  for (const sale of sales) {
    const date = new Date(sale.completedAt);
    if (Number.isNaN(date.getTime()) || date.getUTCFullYear() !== year) {
      continue;
    }
    const row =
      bySeller.get(sale.sellerId) ??
      {
        sellerId: sale.sellerId,
        year,
        sales: 0,
        consideration: 0,
        fees: 0,
        quarters: [0, 1, 2, 3].map(() => ({ sales: 0, consideration: 0, fees: 0 })),
        status: "exempt" as Dac7Status
      };
    const q = row.quarters[Math.floor(date.getUTCMonth() / 3)];
    const amount = Number(sale.amount) || 0;
    const fee = Number(sale.platformFee) || 0;
    row.sales += 1;
    row.consideration += amount;
    row.fees += fee;
    q.sales += 1;
    q.consideration += amount;
    q.fees += fee;
    bySeller.set(sale.sellerId, row);
  }
  return [...bySeller.values()]
    .map((row) => ({
      ...row,
      consideration: round(row.consideration),
      fees: round(row.fees),
      quarters: row.quarters.map((q) => ({ ...q, consideration: round(q.consideration), fees: round(q.fees) })),
      status: dac7Status(row.sales, row.consideration)
    }))
    .sort((a, b) => b.consideration - a.consideration || b.sales - a.sales);
}
