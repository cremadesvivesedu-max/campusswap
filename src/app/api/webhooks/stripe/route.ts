import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { getSellerStripeConnectStatusFromAccount } from "@/lib/payments/stripe-connect";
import { stripe } from "@/lib/payments/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type NotificationPreferenceKey =
  | "listing_updates"
  | "messages"
  | "saved_searches"
  | "featured_digest"
  | "promotions";

type MarketplaceNotificationType =
  | "message"
  | "promotion"
  | "review"
  | "listing"
  | "safety"
  | "system";

type AdminClient = NonNullable<ReturnType<typeof createAdminSupabaseClient>>;

function resolvePendingSellerPayoutStatus(sellerStripeAccountId?: string | null) {
  return sellerStripeAccountId ? "ready" : "blocked";
}

async function getNotificationPreferences(
  admin: AdminClient,
  userId: string
) {
  const { data: profile } = await admin
    .from("profiles")
    .select("notification_preferences")
    .eq("user_id", userId)
    .maybeSingle();

  return (((profile as { notification_preferences?: string[] | null } | null)
    ?.notification_preferences ?? []) as string[]);
}

async function notifyUserEvent(
  admin: AdminClient,
  {
    userId,
    dedupeKey,
    title,
    body,
    href,
    type,
    preference
  }: {
    userId: string;
    dedupeKey: string;
    title: string;
    body: string;
    href?: string;
    type: MarketplaceNotificationType;
    preference?: NotificationPreferenceKey;
  }
) {
  if (preference) {
    const preferences = await getNotificationPreferences(admin, userId);

    if (preferences.length && !preferences.includes(preference)) {
      return;
    }
  }

  const { error: dedupeError } = await admin.from("notification_events").insert({
    user_id: userId,
    dedupe_key: dedupeKey,
    notification_type: type
  });

  if (dedupeError?.code === "23505") {
    return;
  }

  if (dedupeError) {
    throw new Error(dedupeError.message);
  }

  const { error } = await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    destination_href: href ?? null
  });

  if (error) {
    throw new Error(error.message);
  }
}

function getPromotionCheckoutMetadata(session: Stripe.Checkout.Session) {
  return {
    listingId: session.metadata?.listing_id ?? "",
    sellerId: session.metadata?.seller_id ?? "",
    purchaseId:
      session.metadata?.promotion_purchase_id ?? session.client_reference_id ?? "",
    promotionType: session.metadata?.promotion_type ?? ""
  };
}

function getBuyerCheckoutMetadata(session: Stripe.Checkout.Session) {
  return {
    checkoutType: session.metadata?.checkout_type ?? "",
    transactionId:
      session.metadata?.transaction_id ?? session.client_reference_id ?? "",
    listingId: session.metadata?.listing_id ?? "",
    buyerId: session.metadata?.buyer_id ?? "",
    sellerId: session.metadata?.seller_id ?? "",
    sellerConnectedAccountId:
      session.metadata?.seller_connected_account_id ?? "",
    fulfillmentMethod: session.metadata?.fulfillment_method ?? "pickup"
  };
}

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
}

async function syncListingReservationState(admin: AdminClient, listingId: string) {
  const { data: heldTransactions } = await admin
    .from("transactions")
    .select("id")
    .eq("listing_id", listingId)
    .in("state", ["reserved", "paid", "ready-for-pickup", "shipped", "delivered"])
    .limit(1);

  await admin
    .from("listings")
    .update({
      status: heldTransactions?.length ? "reserved" : "active",
      updated_at: new Date().toISOString()
    })
    .eq("id", listingId)
    .neq("status", "sold");
}

async function cancelCompetingTransactions(
  admin: AdminClient,
  {
    listingId,
    preservedTransactionId
  }: {
    listingId: string;
    preservedTransactionId: string;
  }
) {
  const { data: competingRows } = await admin
    .from("transactions")
    .select("id, buyer_id, conversation_id")
    .eq("listing_id", listingId)
    .neq("id", preservedTransactionId)
    .in("state", ["pending", "reserved", "paid", "ready-for-pickup", "shipped", "delivered"]);

  const rows =
    ((competingRows as
      | {
          id: string;
          buyer_id: string;
          conversation_id: string | null;
        }[]
      | null) ?? []);

  if (!rows.length) {
    return;
  }

  const now = new Date().toISOString();

  await admin
    .from("transactions")
    .update({
      state: "cancelled",
      cancelled_at: now,
      updated_at: now
    })
    .in(
      "id",
      rows.map((row) => row.id)
    );

  await Promise.all(
    rows.map((row) =>
      notifyUserEvent(admin, {
        userId: row.buyer_id,
        dedupeKey: `listing-closed:${row.id}`,
        type: "listing",
        preference: "listing_updates",
        title: "Order closed",
        body: "Another buyer completed payment for this listing first.",
        href: row.conversation_id
          ? `/app/messages/${row.conversation_id}`
          : "/app/my-purchases"
      })
    )
  );
}

async function syncConnectedAccountState(
  admin: AdminClient,
  account: Stripe.Account
) {
  const { data: user } = await admin
    .from("users")
    .select("id")
    .eq("stripe_connected_account_id", account.id)
    .maybeSingle();

  if (!user?.id) {
    return;
  }

  const status = getSellerStripeConnectStatusFromAccount(account);
  const now = new Date().toISOString();
  const nextPayoutStatus = status.onboardingComplete ? "ready" : "blocked";

  await admin
    .from("users")
    .update({
      stripe_connected_account_id: account.id,
      stripe_details_submitted: status.detailsSubmitted,
      stripe_charges_enabled: status.chargesEnabled,
      stripe_transfers_enabled: status.transfersEnabled,
      stripe_payouts_enabled: status.payoutsEnabled,
      stripe_onboarding_completed_at: status.onboardingComplete ? now : null,
      updated_at: now
    })
    .eq("id", user.id);

  await admin
    .from("transactions")
    .update({
      seller_stripe_account_id: account.id,
      seller_payout_status: nextPayoutStatus,
      updated_at: now
    })
    .eq("seller_id", user.id)
    .neq("seller_payout_status", "paid_to_connected_account");
}

async function handleCompletedPromotionCheckout(
  admin: AdminClient,
  session: Stripe.Checkout.Session
) {
  const metadata = getPromotionCheckoutMetadata(session);

  if (
    !metadata.listingId ||
    !metadata.sellerId ||
    !metadata.purchaseId ||
    metadata.promotionType !== "featured" ||
    session.payment_status !== "paid"
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

  if (!purchase || purchase.active || purchase.status === "paid") {
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
    notifyUserEvent(admin, {
      userId: metadata.sellerId,
      dedupeKey: `promotion-payment-complete:${purchase.id}`,
      type: "promotion",
      preference: "promotions",
      title: "Payment completed",
      body: "Your EUR 2 featured listing payment was processed successfully.",
      href: `/app/sell?listingId=${metadata.listingId}`
    }),
    notifyUserEvent(admin, {
      userId: metadata.sellerId,
      dedupeKey: `promotion-featured-active:${purchase.id}`,
      type: "promotion",
      preference: "promotions",
      title: "Featured listing is active",
      body: "Your listing is now boosted across CampusSwap featured discovery surfaces.",
      href: `/app/listings/${metadata.listingId}`
    })
  ]);
}

async function handleCompletedBuyerCheckout(
  admin: AdminClient,
  session: Stripe.Checkout.Session
) {
  const metadata = getBuyerCheckoutMetadata(session);

  if (
    metadata.checkoutType !== "listing_purchase" ||
    !metadata.transactionId ||
    !metadata.listingId ||
    !metadata.buyerId ||
    !metadata.sellerId ||
    session.payment_status !== "paid"
  ) {
    return;
  }

  const { data: transaction } = await admin
    .from("transactions")
    .select(
      "id, listing_id, buyer_id, seller_id, state, checkout_status, conversation_id, fulfillment_method, seller_stripe_account_id, paid_at"
    )
    .eq("id", metadata.transactionId)
    .eq("listing_id", metadata.listingId)
    .eq("buyer_id", metadata.buyerId)
    .eq("seller_id", metadata.sellerId)
    .maybeSingle();

  if (
    !transaction ||
    transaction.paid_at ||
    transaction.checkout_status === "paid" ||
    transaction.checkout_status === "cancelled"
  ) {
    return;
  }

  const now = new Date().toISOString();
  const sellerStripeAccountId =
    metadata.sellerConnectedAccountId || transaction.seller_stripe_account_id || null;

  await admin
    .from("transactions")
    .update({
      state: "paid",
      checkout_status: "paid",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: getPaymentIntentId(session) ?? null,
      seller_stripe_account_id: sellerStripeAccountId,
      seller_payout_status: "paid_to_connected_account",
      paid_at: now,
      updated_at: now
    })
    .eq("id", transaction.id);

  await admin
    .from("listings")
    .update({
      status: "reserved",
      updated_at: now
    })
    .eq("id", metadata.listingId)
    .neq("status", "sold");

  await cancelCompetingTransactions(admin, {
    listingId: metadata.listingId,
    preservedTransactionId: transaction.id
  });

  const destinationHref = transaction.conversation_id
    ? `/app/messages/${transaction.conversation_id}`
    : "/app/my-purchases";
  const fulfillmentLabel =
    (transaction.fulfillment_method ?? metadata.fulfillmentMethod) === "shipping"
      ? "shipping"
      : "pickup";

  await Promise.all([
    notifyUserEvent(admin, {
      userId: metadata.buyerId,
      dedupeKey: `buyer-payment-complete:${transaction.id}`,
      type: "listing",
      preference: "listing_updates",
      title: "Payment completed",
      body:
        fulfillmentLabel === "shipping"
          ? "Your payment went through. The seller can now prepare shipment."
          : "Your payment went through. The seller can now prepare pickup.",
      href: "/app/my-purchases"
    }),
    notifyUserEvent(admin, {
      userId: metadata.sellerId,
      dedupeKey: `seller-payment-complete:${transaction.id}`,
      type: "listing",
      preference: "listing_updates",
      title: "Buyer payment received",
      body:
        fulfillmentLabel === "shipping"
          ? "A buyer paid for this item with shipping. You can prepare dispatch now."
          : "A buyer paid for this item. You can prepare the pickup handoff now.",
      href: destinationHref
    })
  ]);
}

async function handleExpiredPromotionCheckout(
  admin: AdminClient,
  session: Stripe.Checkout.Session
) {
  const metadata = getPromotionCheckoutMetadata(session);
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

async function handleExpiredBuyerCheckout(
  admin: AdminClient,
  session: Stripe.Checkout.Session
) {
  const metadata = getBuyerCheckoutMetadata(session);

  if (metadata.checkoutType !== "listing_purchase" || !metadata.transactionId) {
    return;
  }

  const { data: transaction } = await admin
    .from("transactions")
    .select("id, listing_id, state, checkout_status, seller_stripe_account_id, paid_at")
    .eq("id", metadata.transactionId)
    .maybeSingle();

  if (!transaction || transaction.paid_at || transaction.checkout_status === "paid") {
    return;
  }

  await admin
    .from("transactions")
    .update({
      state: "pending",
      checkout_status: "cancelled",
      seller_payout_status: resolvePendingSellerPayoutStatus(
        transaction.seller_stripe_account_id
      ),
      reserved_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", transaction.id)
    .in("state", ["pending", "reserved"]);

  await syncListingReservationState(admin, transaction.listing_id);
}

async function handleCompletedCheckout(session: Stripe.Checkout.Session) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  if (session.metadata?.checkout_type === "listing_purchase") {
    await handleCompletedBuyerCheckout(admin, session);
    return;
  }

  await handleCompletedPromotionCheckout(admin, session);
}

async function handleExpiredCheckout(session: Stripe.Checkout.Session) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  if (session.metadata?.checkout_type === "listing_purchase") {
    await handleExpiredBuyerCheckout(admin, session);
    return;
  }

  await handleExpiredPromotionCheckout(admin, session);
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
    case "account.updated":
      {
        const admin = createAdminSupabaseClient();

        if (!admin) {
          throw new Error("Supabase admin client is not configured.");
        }

        await syncConnectedAccountState(admin, event.data.object as Stripe.Account);
      }
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
