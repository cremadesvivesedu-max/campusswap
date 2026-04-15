import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildSiteUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("transactionId") ?? "";

  let checkoutState = "processing";

  if (transactionId) {
    const admin = createAdminSupabaseClient();

    if (admin) {
      const { data } = await admin
        .from("transactions")
        .select("checkout_status, paid_at")
        .eq("id", transactionId)
        .maybeSingle();

      if (data?.paid_at || data?.checkout_status === "paid") {
        checkoutState = "paid";
      }
    }
  }

  return NextResponse.redirect(
    buildSiteUrl(
      `/app/my-purchases?checkout=${encodeURIComponent(checkoutState)}`
    )
  );
}
