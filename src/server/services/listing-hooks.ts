import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { listingMatchesWanted } from "@/features/wanted/match";
import { daysListed, suggestPriceDrop } from "@/features/listings/price-suggestion";

type AdminClient = NonNullable<ReturnType<typeof createAdminSupabaseClient>>;

async function notifyOnce(
  admin: AdminClient,
  input: { userId: string; dedupeKey: string; title: string; body: string; href: string; type: "listing" | "system" }
) {
  const { error } = await admin.from("notification_events").insert({
    user_id: input.userId,
    dedupe_key: input.dedupeKey,
    notification_type: input.type
  });

  if (error) {
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

/** Tells people with a matching open "I'm looking for…" request. Never throws. */
export async function notifyWantedMatches(listing: {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  categorySlug: string;
  price: number;
}) {
  const admin = createAdminSupabaseClient();
  if (!admin) return 0;

  try {
    const { data } = await admin
      .from("wanted_requests")
      .select("id, user_id, title, category_slug, max_price")
      .eq("status", "open")
      .gt("expires_at", new Date().toISOString())
      .neq("user_id", listing.sellerId)
      .limit(500);
    const rows =
      (data as { id: string; user_id: string; title: string; category_slug: string | null; max_price: number | string | null }[] | null) ?? [];
    let sent = 0;

    for (const row of rows) {
      const matches = listingMatchesWanted(
        { title: row.title, categorySlug: row.category_slug, maxPrice: row.max_price === null ? null : Number(row.max_price) },
        listing
      );
      if (!matches) continue;

      const delivered = await notifyOnce(admin, {
        userId: row.user_id,
        dedupeKey: `wanted-match:${row.id}:${listing.id}`,
        type: "listing",
        title: "Something you wanted is here",
        body: `${listing.title} matches what you asked for: "${row.title}".`,
        href: `/app/listings/${listing.id}`
      });
      if (delivered) sent += 1;
    }

    return sent;
  } catch (error) {
    console.error("Wanted matching failed:", error);
    return 0;
  }
}

/** Lets every admin know a listing was held or flagged by the automatic checks. */
export async function notifyAdminsOfListingRisk(listing: { id: string; title: string }, reasons: string[]) {
  const admin = createAdminSupabaseClient();
  if (!admin || !reasons.length) return;

  const { data: admins } = await admin.from("users").select("id").eq("role", "admin");
  await Promise.all(
    ((admins as { id: string }[] | null) ?? []).map((row) =>
      notifyOnce(admin, {
        userId: row.id,
        dedupeKey: `listing-risk:${listing.id}`,
        type: "system",
        title: "Listing needs a check",
        body: `${listing.title} was held for a check: ${reasons.join("; ")}`,
        href: "/admin/listings"
      })
    )
  );
}

/**
 * Daily: sellers whose listing has sat for 7+ days without a single chat get one
 * suggestion to lower the price (once per listing).
 */
export async function sendPriceDropNudges(admin: AdminClient, now = new Date()) {
  const day = 24 * 60 * 60 * 1000;
  const { data } = await admin
    .from("listings")
    .select("id, seller_id, title, price, created_at")
    .eq("status", "active")
    .lte("created_at", new Date(now.getTime() - 7 * day).toISOString())
    .gte("created_at", new Date(now.getTime() - 30 * day).toISOString())
    .limit(300);
  const listings = (data as { id: string; seller_id: string; title: string; price: number | string; created_at: string }[] | null) ?? [];

  if (!listings.length) return 0;

  const { data: conversations } = await admin
    .from("conversations")
    .select("listing_id")
    .in("listing_id", listings.map((listing) => listing.id));
  const withChats = new Set(((conversations as { listing_id: string }[] | null) ?? []).map((row) => row.listing_id));
  let sent = 0;

  for (const listing of listings) {
    if (withChats.has(listing.id)) continue;
    const price = Number(listing.price);
    const dropTo = suggestPriceDrop(price);
    if (!dropTo) continue;

    const delivered = await notifyOnce(admin, {
      userId: listing.seller_id,
      dedupeKey: `price-nudge:${listing.id}`,
      type: "listing",
      title: "Time for a price drop?",
      body: `${listing.title} has been listed for ${daysListed(listing.created_at, now)} days. Dropping to €${dropTo} usually brings new chats.`,
      href: "/app/my-listings"
    });
    if (delivered) sent += 1;
  }

  return sent;
}

/**
 * Daily: if someone wrote to you 20–44 hours ago and you have not answered, one gentle
 * reminder (grouped per person, so several chats become one notification).
 */
export async function sendUnansweredChatReminders(admin: AdminClient, now = new Date()) {
  const hour = 60 * 60 * 1000;
  const from = new Date(now.getTime() - 44 * hour).toISOString();
  const to = new Date(now.getTime() - 20 * hour).toISOString();

  const { data: conversations } = await admin
    .from("conversations")
    .select("id, listing_id, buyer_id, seller_id, blocked_by")
    .gte("updated_at", from)
    .limit(500);
  const rows =
    (conversations as { id: string; listing_id: string; buyer_id: string; seller_id: string; blocked_by: string | null }[] | null) ?? [];
  const open = rows.filter((row) => !row.blocked_by);

  if (!open.length) return 0;

  const { data: messages } = await admin
    .from("messages")
    .select("conversation_id, sender_id, sent_at")
    .in("conversation_id", open.map((row) => row.id))
    .order("sent_at", { ascending: false })
    .limit(5000);
  const last = new Map<string, { sender_id: string; sent_at: string }>();
  for (const message of (messages as { conversation_id: string; sender_id: string; sent_at: string }[] | null) ?? []) {
    if (!last.has(message.conversation_id)) last.set(message.conversation_id, message);
  }

  // recipient -> conversations waiting on them
  const waiting = new Map<string, { conversationId: string; senderId: string; listingId: string }[]>();
  for (const conversation of open) {
    const message = last.get(conversation.id);
    if (!message || message.sent_at < from || message.sent_at > to) continue;
    const recipient = message.sender_id === conversation.buyer_id ? conversation.seller_id : conversation.buyer_id;
    const list = waiting.get(recipient) ?? [];
    list.push({ conversationId: conversation.id, senderId: message.sender_id, listingId: conversation.listing_id });
    waiting.set(recipient, list);
  }

  if (!waiting.size) return 0;

  const all = [...waiting.values()].flat();
  const [{ data: profiles }, { data: listings }] = await Promise.all([
    admin.from("profiles").select("user_id, full_name").in("user_id", [...new Set(all.map((item) => item.senderId))]),
    admin.from("listings").select("id, title").in("id", [...new Set(all.map((item) => item.listingId))])
  ]);
  const names = new Map(((profiles as { user_id: string; full_name: string | null }[] | null) ?? []).map((row) => [row.user_id, row.full_name ?? ""]));
  const titles = new Map(((listings as { id: string; title: string }[] | null) ?? []).map((row) => [row.id, row.title]));
  const day = now.toISOString().slice(0, 10);
  let sent = 0;

  for (const [recipient, items] of waiting) {
    const first = items[0];
    const name = (names.get(first.senderId) || "Someone").split(" ")[0];
    const delivered = await notifyOnce(admin, {
      userId: recipient,
      dedupeKey: `unanswered:${recipient}:${day}`,
      type: "listing",
      title: "Someone is waiting for your reply",
      body:
        items.length === 1
          ? `${name} is waiting for your answer about ${titles.get(first.listingId) ?? "your listing"}.`
          : `You have ${items.length} unanswered chats.`,
      href: items.length === 1 ? `/app/messages/${first.conversationId}` : "/app/messages"
    });
    if (delivered) sent += 1;
  }

  return sent;
}

/**
 * Sundays: "12 new listings this week in Bikes and Furniture" for everyone who keeps the
 * weekly digest on. It is a normal notification, so it also goes out as push, and by
 * email as soon as email sending is configured.
 */
export async function sendWeeklyDigest(admin: AdminClient, now = new Date()) {
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: listingRows }, { data: profileRows }] = await Promise.all([
    admin
      .from("listings")
      .select("id, seller_id, category:categories(slug, name)")
      .eq("status", "active")
      .gte("created_at", since)
      .limit(2000),
    admin.from("profiles").select("user_id, preferred_categories, notification_preferences").limit(5000)
  ]);
  const listings = ((listingRows as { id: string; seller_id: string; category: { slug: string; name: string } | { slug: string; name: string }[] | null }[] | null) ?? []).map(
    (row) => ({ id: row.id, sellerId: row.seller_id, category: Array.isArray(row.category) ? row.category[0] : row.category })
  );

  if (listings.length < 3) return 0;

  const weekKey = now.toISOString().slice(0, 10);
  let sent = 0;

  for (const profile of (profileRows as { user_id: string; preferred_categories: unknown; notification_preferences: unknown }[] | null) ?? []) {
    const preferences = Array.isArray(profile.notification_preferences) ? profile.notification_preferences : [];
    if (preferences.length && !preferences.includes("featured_digest")) continue;

    const wanted = Array.isArray(profile.preferred_categories) ? (profile.preferred_categories as string[]) : [];
    const relevant = listings.filter(
      (listing) => listing.sellerId !== profile.user_id && (!wanted.length || (listing.category && wanted.includes(listing.category.slug)))
    );
    if (relevant.length < 3) continue;

    const counts = new Map<string, number>();
    for (const listing of relevant) {
      if (listing.category) counts.set(listing.category.name, (counts.get(listing.category.name) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([name]) => name);

    const delivered = await notifyOnce(admin, {
      userId: profile.user_id,
      dedupeKey: `weekly-digest:${profile.user_id}:${weekKey}`,
      type: "listing",
      title: "New this week on CampusSwap",
      body: `${relevant.length} new listings this week in ${top.join(" and ") || "your categories"}. Have a look before they're gone.`,
      href: "/app/search?sort=newest"
    });
    if (delivered) sent += 1;
  }

  return sent;
}
