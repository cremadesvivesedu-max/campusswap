import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { releaseHeldPayout } from "@/lib/payments/stripe";
import { BUYER_PROTECTION_DAYS } from "@/lib/shipping/tracking";
import type { ShipmentDetails } from "@/types/domain";

type AdminClient = NonNullable<ReturnType<typeof createAdminSupabaseClient>>;

interface ShipmentRow {
  transaction_id: string;
  carrier: string;
  tracking_number: string;
  tracking_url: string | null;
  shipped_at: string;
  payout_released_at: string | null;
}

function mapShipment(row: ShipmentRow): ShipmentDetails {
  return {
    transactionId: row.transaction_id,
    carrier: row.carrier,
    trackingNumber: row.tracking_number,
    trackingUrl: row.tracking_url ?? undefined,
    shippedAt: row.shipped_at,
    payoutReleasedAt: row.payout_released_at ?? undefined
  };
}

/** Tracking for one order. Returns undefined (never throws) if the table is not there yet. */
export async function getShipmentForTransaction(transactionId: string) {
  const admin = createAdminSupabaseClient();

  if (!admin) {
    return undefined;
  }

  const { data, error } = await admin
    .from("shipments")
    .select("transaction_id, carrier, tracking_number, tracking_url, shipped_at, payout_released_at")
    .eq("transaction_id", transactionId)
    .maybeSingle();

  if (error) {
    console.error("Shipment lookup failed:", error.message);
    return undefined;
  }

  return data ? mapShipment(data as ShipmentRow) : undefined;
}

export async function saveShipment(
  admin: AdminClient,
  input: { transactionId: string; carrier: string; trackingNumber: string; trackingUrl: string | null }
) {
  const now = new Date().toISOString();
  const { error } = await admin.from("shipments").upsert(
    {
      transaction_id: input.transactionId,
      carrier: input.carrier,
      tracking_number: input.trackingNumber,
      tracking_url: input.trackingUrl,
      shipped_at: now,
      updated_at: now
    },
    { onConflict: "transaction_id" }
  );

  return error ? error.message : null;
}

async function notifyOnce(
  admin: AdminClient,
  input: { userId: string; dedupeKey: string; title: string; body: string; href: string; type: "listing" | "review" | "system" }
) {
  const { error } = await admin.from("notification_events").insert({
    user_id: input.userId,
    dedupe_key: input.dedupeKey,
    notification_type: input.type
  });

  if (error) {
    // 23505 = already sent; anything else we log and skip rather than double-notify.
    if (error.code !== "23505") {
      console.error("Notification dedupe insert failed:", error.message);
    }
    return false;
  }

  await admin.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    destination_href: input.href
  });

  return true;
}

/**
 * Pays the seller for a held (shipping) order. No-op for orders that were already paid
 * out or were direct charges. Errors are returned, not thrown, so the order can still
 * complete and the daily job retries later.
 */
export async function releasePayoutForTransaction(admin: AdminClient, transactionId: string) {
  const { data: transaction } = await admin
    .from("transactions")
    .select(
      "id, seller_id, seller_payout_status, stripe_payment_intent_id, seller_stripe_account_id, seller_net_amount, paid_at"
    )
    .eq("id", transactionId)
    .maybeSingle();

  if (
    !transaction ||
    !transaction.paid_at ||
    // "ready" after payment means the money is still held by CampusSwap.
    transaction.seller_payout_status !== "ready" ||
    !transaction.stripe_payment_intent_id ||
    !transaction.seller_stripe_account_id
  ) {
    return { released: false as const };
  }

  try {
    const transfer = await releaseHeldPayout({
      transactionId: transaction.id,
      paymentIntentId: transaction.stripe_payment_intent_id,
      sellerConnectedAccountId: transaction.seller_stripe_account_id,
      sellerNetAmount: Number(transaction.seller_net_amount ?? 0)
    });
    const now = new Date().toISOString();

    await admin
      .from("transactions")
      .update({ seller_payout_status: "paid_to_connected_account", updated_at: now })
      .eq("id", transaction.id);

    await admin
      .from("shipments")
      .update({
        stripe_transfer_id: transfer?.id ?? null,
        payout_released_at: now,
        updated_at: now
      })
      .eq("transaction_id", transaction.id);

    await notifyOnce(admin, {
      userId: transaction.seller_id,
      dedupeKey: `payout-released:${transaction.id}`,
      type: "listing",
      title: "You've been paid",
      body: "The buyer's payment is on its way to your Stripe account.",
      href: "/app/my-purchases"
    });

    return { released: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Payout release failed for ${transaction.id}:`, message);
    return { released: false as const, error: message };
  }
}

/** Notifications that ask both sides for stars once an exchange is done. */
export async function sendReviewRequests(
  admin: AdminClient,
  transaction: { id: string; buyer_id: string; seller_id: string },
  round: "now" | "reminder"
) {
  const href = `/app/reviews/new/${transaction.id}`;
  const sides = [
    { userId: transaction.buyer_id, who: "seller" },
    { userId: transaction.seller_id, who: "buyer" }
  ];

  await Promise.all(
    sides.map(async (side) => {
      if (round === "reminder") {
        const { data: existing } = await admin
          .from("reviews")
          .select("id")
          .eq("transaction_id", transaction.id)
          .eq("author_id", side.userId)
          .maybeSingle();

        if (existing) {
          return;
        }
      }

      await notifyOnce(admin, {
        userId: side.userId,
        dedupeKey: `review-${round}:${transaction.id}:${side.userId}`,
        type: "review",
        title: round === "now" ? "How did it go? ⭐" : "Still time to leave a review ⭐",
        body:
          round === "now"
            ? `Rate the ${side.who} in one tap. Reviews help every student trade safely.`
            : `Your exchange is done. Give the ${side.who} a few stars — it takes 10 seconds.`,
        href
      });
    })
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Daily housekeeping:
 * 1. Shipped orders past the protection window with no open support ticket are completed
 *    and the seller is paid.
 * 2. Completed held orders whose payout failed earlier are retried.
 * 3. Two days after an exchange, people who have not reviewed get one reminder.
 */
export async function runDailyOrderJobs(admin: AdminClient, now = new Date()) {
  const summary = { autoCompleted: 0, payoutsReleased: 0, payoutErrors: 0, reviewReminders: 0 };
  const protectionCutoff = new Date(now.getTime() - BUYER_PROTECTION_DAYS * DAY_MS).toISOString();

  const { data: overdue } = await admin
    .from("transactions")
    .select("id, listing_id, buyer_id, seller_id, conversation_id, delivered_at")
    .in("state", ["shipped", "delivered"])
    .lte("shipped_at", protectionCutoff)
    .limit(100);

  for (const transaction of overdue ?? []) {
    const { count: openTickets } = await admin
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("transaction_id", transaction.id)
      .in("status", ["open", "in-review"]);

    if (openTickets) {
      continue;
    }

    const stamp = now.toISOString();
    await admin
      .from("transactions")
      .update({
        state: "completed",
        delivered_at: transaction.delivered_at ?? stamp,
        completed_at: stamp,
        updated_at: stamp
      })
      .eq("id", transaction.id);
    await admin
      .from("listings")
      .update({ status: "sold", updated_at: stamp })
      .eq("id", transaction.listing_id);

    if (transaction.conversation_id) {
      await admin.from("messages").insert({
        conversation_id: transaction.conversation_id,
        sender_id: transaction.seller_id,
        text: `The ${BUYER_PROTECTION_DAYS}-day buyer protection window ended without a reported problem, so CampusSwap completed this order.`
      });
    }

    summary.autoCompleted += 1;
    const result = await releasePayoutForTransaction(admin, transaction.id);
    if (result.released) summary.payoutsReleased += 1;
    if ("error" in result && result.error) summary.payoutErrors += 1;
    await sendReviewRequests(admin, transaction, "now");
  }

  const { data: stuck } = await admin
    .from("transactions")
    .select("id")
    .eq("state", "completed")
    .eq("seller_payout_status", "ready")
    .not("paid_at", "is", null)
    .limit(50);

  for (const transaction of stuck ?? []) {
    const result = await releasePayoutForTransaction(admin, transaction.id);
    if (result.released) summary.payoutsReleased += 1;
    if ("error" in result && result.error) summary.payoutErrors += 1;
  }

  const { data: recent } = await admin
    .from("transactions")
    .select("id, buyer_id, seller_id")
    .eq("state", "completed")
    .lte("completed_at", new Date(now.getTime() - 2 * DAY_MS).toISOString())
    .gte("completed_at", new Date(now.getTime() - 9 * DAY_MS).toISOString())
    .limit(200);

  for (const transaction of recent ?? []) {
    await sendReviewRequests(admin, transaction, "reminder");
    summary.reviewReminders += 1;
  }

  return summary;
}
