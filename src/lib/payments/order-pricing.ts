// Buyer-side fee for orders paid through CampusSwap ("buyer protection").
// Launch decision (see material/CampusSwap_Financial_Model_v2.xlsx): free for the first
// months, then 5% + €0.50 — below Vinted's ~5% + €0.70. Cash meetups never pay a fee.

export const BUYER_FEE_RATE = 0.05;
export const BUYER_FEE_FIXED = 0.5;

/** First day fees apply. Override with NEXT_PUBLIC_FEES_START_DATE (YYYY-MM-DD). */
export const DEFAULT_FEES_START_DATE = "2027-08-01";

export function roundCurrencyAmount(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function feesStartDate() {
  const configured = process.env.NEXT_PUBLIC_FEES_START_DATE;
  return configured && /^\d{4}-\d{2}-\d{2}$/.test(configured)
    ? configured
    : DEFAULT_FEES_START_DATE;
}

/** True while CampusSwap is in its free launch period. */
export function isFreeLaunchPeriod(now = new Date()) {
  return now.getTime() < Date.parse(`${feesStartDate()}T00:00:00Z`);
}

export function calculatePlatformFee(itemAmount: number, now = new Date()) {
  const normalizedItemAmount = roundCurrencyAmount(Math.max(0, itemAmount));

  if (normalizedItemAmount === 0 || isFreeLaunchPeriod(now)) {
    return 0;
  }

  return roundCurrencyAmount(normalizedItemAmount * BUYER_FEE_RATE + BUYER_FEE_FIXED);
}

export function createOrderBreakdown(input: {
  itemAmount: number;
  shippingAmount: number;
  platformFee?: number;
  now?: Date;
}) {
  const itemAmount = roundCurrencyAmount(Math.max(0, input.itemAmount));
  const shippingAmount = roundCurrencyAmount(Math.max(0, input.shippingAmount));
  const platformFee = roundCurrencyAmount(
    input.platformFee ?? calculatePlatformFee(itemAmount, input.now)
  );
  const sellerNetAmount = roundCurrencyAmount(itemAmount + shippingAmount);
  const totalAmount = roundCurrencyAmount(
    itemAmount + shippingAmount + platformFee
  );

  return {
    amount: itemAmount,
    shipping_amount: shippingAmount,
    platform_fee: platformFee,
    seller_net_amount: sellerNetAmount,
    total_amount: totalAmount
  };
}
