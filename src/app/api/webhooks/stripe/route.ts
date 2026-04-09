import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { stripe } from "@/lib/payments/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function notifyPromotionEvent(
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>,
  {
    userId,
    dedupeKey,
    title,
    body
  }: {
    userId: string;
    dedupeKey: string;
    title: string;
    body: string;
  }
) {
  const { data: profile } = await admin
    .from("profiles")
    .select("notification_preferences")
    .eq("user_id", userId)
    .maybeSingle();

  const preferences =
    (((profile as { notification_preferences?: string[] | null } | null)
      ?.notification_preferences ?? []) as string[]);

  if (preferences.length && !preferences.includes("promotions")) {
    return;
  }

  const { error: dedupeError } = await admin.from("notification_events").insert({
    user_id: userId,
    dedupe_key: dedupeKey,
    notification_type: "promotion"
  });

  if (dedupeError?.code === "23505") {
    return;
  }

  if (dedupeError) {
    throw new Error(dedupeError.message);
  }

  const { error } = await admin.from("notifications").insert({
    user_id: userId,
    type: "promotion",
    title,
    body
  });

  if (error) {
    throw new Error(error.message);
  }
}

function getCheckoutMetadata(session: Stripe.Checkout.Session) {
  return {
    listingId: session.metadata?.listing_id ?? "",
    sellerId: session.metadata?.seller_id ?? "",
    purchaseId:
      session.metadata?.promotion_purchase_id ?? session.client_reference_id ?? "",
    promotionType: session.metadata?.promotion_type ?? ""
  };
}

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
}

async function handleCompletedCheckout(session: Stripe.Checkout.Session) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const metadata = getCheckoutMetadata(session);

  if (
    !metadata.listingId ||
    !metadata.sellerId ||
    !metadata.purchaseId ||
    metadata.promotionType !== "featured"
  ) {
    return;
  }

  const { data: purchase } = await admin
    .from("promotion_purchases")
    .select("id, status, active")
    .eq("id", metadata.purchaseId)
    .eq("listing_id", metadata.listingId)
    .eq("seller_id", metadata.sellerId)
    .eq("type", "featured")
    .maybeSingle();

  if (!purchase) {
    return;
  }

  if (purchase.active || purchase.status === "paid") {
    return;
  }

  const now = new Date().toISOString();

  await admin
    .from("promotion_purchases")
    .update({
      status: "paid",
      active: true,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: getPaymentIntentId(session) ?? null,
      paid_at: now,
      cancelled_at: null,
      updated_at: now
    })
    .eq("id", purchase.id);

  await admin
    .from("listings")
    .update({
      featured: true,
      updated_at: now
    })
    .eq("id", metadata.listingId)
    .eq("seller_id", metadata.sellerId);

  await Promise.all([
    notifyPromotionEvent(admin, {
      userId: metadata.sellerId,
      dedupeKey: `promotion-payment-complete:${purchase.id}`,
      title: "Payment completed",
      body: "Your EUR 2 featured listing payment was processed successfully."
    }),
    notifyPromotionEvent(admin, {
      userId: metadata.sellerId,
      dedupeKey: `promotion-featured-active:${purchase.id}`,
      title: "Featured listing is active",
      body: "Your listing is now boosted across CampusSwap featured discovery surfaces."
    })
  ]);
}

async function handleExpiredCheckout(session: Stripe.Checkout.Session) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const metadata = getCheckoutMetadata(session);
  const purchaseId = metadata.purchaseId;

  if (!purchaseId) {
    return;
  }

  const { data: purchase } = await admin
    .from("promotion_purchases")
    .select("id, status, active")
    .eq("id", purchaseId)
    .maybeSingle();

  if (!purchase || purchase.active || purchase.status === "paid") {
    return;
  }

  await admin
    .from("promotion_purchases")
    .update({
      status: "cancelled",
      active: false,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", purchase.id);
}

export async function POST(request: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { ok: false, message: "Stripe not configured." },
      { status: 400 }
    );
  }

  const signature = (await headers()).get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json(
      { ok: false, message: "Missing signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Invalid Stripe signature."
      },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCompletedCheckout(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.expired":
      await handleExpiredCheckout(event.data.object as Stripe.Checkout.Session);
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
