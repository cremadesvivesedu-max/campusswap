import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildSiteUrl } from "@/lib/site-url";

async function syncListingReservationState(
  listingId: string,
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>
) {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId") ?? "";
  const transactionId = searchParams.get("transactionId") ?? "";
  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();

  if (transactionId && supabase && admin) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user?.id) {
      await admin
        .from("transactions")
        .update({
          state: "pending",
          checkout_status: "cancelled",
          reserved_at: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", transactionId)
        .eq("buyer_id", user.id)
        .is("paid_at", null)
        .in("state", ["pending", "reserved"]);

      if (listingId) {
        await syncListingReservationState(listingId, admin);
      }
    }
  }

  return NextResponse.redirect(
    buildSiteUrl("/app/my-purchases?checkout=cancelled")
  );
}
