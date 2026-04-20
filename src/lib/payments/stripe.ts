import Stripe from "stripe";
import { env } from "@/lib/env";
import { roundCurrencyAmount } from "@/lib/payments/order-pricing";
import { buildSiteUrl } from "@/lib/site-url";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia"
    })
  : null;

interface FeaturedCheckoutSessionInput {
  listingId: string;
  sellerId: string;
  promotionPurchaseId: string;
  listingTitle: string;
  amount: number;
}

interface BuyerCheckoutSessionInput {
  transactionId: string;
  listingId: string;
  buyerId: string;
  buyerEmail?: string;
  sellerId: string;
  listingTitle: string;
  fulfillmentMethod: "pickup" | "shipping";
  itemAmount: number;
  shippingAmount: number;
  platformFee: number;
}

function toMinorUnit(amount: number) {
  return Math.round(roundCurrencyAmount(amount) * 100);
}

export async function createFeaturedCheckoutSession({
  listingId,
  sellerId,
  promotionPurchaseId,
  listingTitle,
  amount
}: FeaturedCheckoutSessionInput) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: promotionPurchaseId,
    success_url: buildSiteUrl(
      `/promotion/featured/success?listingId=${encodeURIComponent(listingId)}&purchaseId=${encodeURIComponent(promotionPurchaseId)}&session_id={CHECKOUT_SESSION_ID}`
    ),
    cancel_url: buildSiteUrl(
      `/promotion/featured/cancel?listingId=${encodeURIComponent(listingId)}&purchaseId=${encodeURIComponent(promotionPurchaseId)}`
    ),
    metadata: {
      listing_id: listingId,
      seller_id: sellerId,
      promotion_type: "featured",
      promotion_purchase_id: promotionPurchaseId
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: toMinorUnit(amount),
          product_data: {
            name: "CampusSwap featured listing",
            description: `Highlight "${listingTitle}" across featured discovery surfaces in Maastricht.`
          }
        }
      }
    ]
  });
}

export async function createBuyerCheckoutSession({
  transactionId,
  listingId,
  buyerId,
  buyerEmail,
  sellerId,
  listingTitle,
  fulfillmentMethod,
  itemAmount,
  shippingAmount,
  platformFee
}: BuyerCheckoutSessionInput) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: transactionId,
    customer_email: buyerEmail,
    success_url: buildSiteUrl(
      `/purchase/checkout/success?listingId=${encodeURIComponent(listingId)}&transactionId=${encodeURIComponent(transactionId)}&session_id={CHECKOUT_SESSION_ID}`
    ),
    cancel_url: buildSiteUrl(
      `/purchase/checkout/cancel?listingId=${encodeURIComponent(listingId)}&transactionId=${encodeURIComponent(transactionId)}`
    ),
    metadata: {
      checkout_type: "listing_purchase",
      transaction_id: transactionId,
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      fulfillment_method: fulfillmentMethod,
      item_amount: itemAmount.toFixed(2),
      shipping_amount: shippingAmount.toFixed(2),
      platform_fee: platformFee.toFixed(2),
      total_amount: (itemAmount + shippingAmount + platformFee).toFixed(2)
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: toMinorUnit(itemAmount),
          product_data: {
            name: listingTitle,
            description: "CampusSwap listing purchase"
          }
        }
      },
      ...(shippingAmount > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: toMinorUnit(shippingAmount),
                product_data: {
                  name: "Shipping",
                  description: "CampusSwap shipping surcharge"
                }
              }
            }
          ]
        : []),
      ...(platformFee > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: toMinorUnit(platformFee),
                product_data: {
                  name: "CampusSwap platform fee",
                  description: "Marketplace service fee applied to the item price"
                }
              }
            }
          ]
        : [])
    ]
  });
}
