import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildSiteUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId") ?? "";
  const purchaseId = searchParams.get("purchaseId") ?? "";
  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();

  if (purchaseId && supabase && admin) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user?.id) {
      await admin
        .from("promotion_purchases")
        .update({
          status: "cancelled",
          active: false,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", purchaseId)
        .eq("seller_id", user.id)
        .neq("status", "paid");
    }
  }

  return NextResponse.redirect(
    buildSiteUrl(
      `/app/sell?listingId=${encodeURIComponent(listingId)}&promotion=cancelled`
    )
  );
}
