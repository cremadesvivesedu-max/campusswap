import Stripe from "stripe";
import { env } from "@/lib/env";
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

function toMinorUnit(amount: number) {
  return Math.round(amount * 100);
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
