import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildSiteUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId") ?? "";
  const purchaseId = searchParams.get("purchaseId") ?? "";

  let promotionState = "processing";

  if (purchaseId) {
    const admin = createAdminSupabaseClient();

    if (admin) {
      const { data } = await admin
        .from("promotion_purchases")
        .select("status, active")
        .eq("id", purchaseId)
        .maybeSingle();

      if (data?.active || data?.status === "paid") {
        promotionState = "paid";
      }
    }
  }

  return NextResponse.redirect(
    buildSiteUrl(
      `/app/sell?listingId=${encodeURIComponent(listingId)}&promotion=${promotionState}`
    )
  );
}
