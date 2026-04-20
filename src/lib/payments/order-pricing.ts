export function roundCurrencyAmount(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculatePlatformFee(itemAmount: number) {
  const normalizedItemAmount = roundCurrencyAmount(Math.max(0, itemAmount));

  if (normalizedItemAmount <= 15) {
    return 1.5;
  }

  if (normalizedItemAmount <= 80) {
    return roundCurrencyAmount(normalizedItemAmount * 0.1);
  }

  if (normalizedItemAmount <= 250) {
    return roundCurrencyAmount(normalizedItemAmount * 0.08);
  }

  return roundCurrencyAmount(normalizedItemAmount * 0.06);
}

export function createOrderBreakdown(input: {
  itemAmount: number;
  shippingAmount: number;
  platformFee?: number;
}) {
  const itemAmount = roundCurrencyAmount(Math.max(0, input.itemAmount));
  const shippingAmount = roundCurrencyAmount(Math.max(0, input.shippingAmount));
  const platformFee = roundCurrencyAmount(
    input.platformFee ?? calculatePlatformFee(itemAmount)
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
