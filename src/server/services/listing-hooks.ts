import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { listingMatchesWanted } from "@/features/wanted/match";

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
