import { NextResponse } from "next/server";
import {
  createSellerOnboardingLink,
  getSellerStripeConnectStatusFromAccount,
  retrieveSellerConnectedAccount
} from "@/lib/payments/stripe-connect";
import { buildSiteUrl } from "@/lib/site-url";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function settingsRedirect(status: string) {
  return NextResponse.redirect(
    buildSiteUrl(`/app/settings?stripe=${encodeURIComponent(status)}`)
  );
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();

  if (!supabase || !admin) {
    return settingsRedirect("error");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return settingsRedirect("error");
  }

  const { data: seller } = await admin
    .from("users")
    .select("stripe_connected_account_id")
    .eq("id", user.id)
    .maybeSingle();

  const accountId = seller?.stripe_connected_account_id;

  if (!accountId) {
    return settingsRedirect("missing");
  }

  try {
    const account = await retrieveSellerConnectedAccount(accountId);
    const status = getSellerStripeConnectStatusFromAccount(account);
    const now = new Date().toISOString();

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
        seller_payout_status: status.onboardingComplete ? "ready" : "blocked",
        updated_at: now
      })
      .eq("seller_id", user.id)
      .neq("seller_payout_status", "paid_to_connected_account");

    if (status.onboardingComplete) {
      return settingsRedirect("ready");
    }

    const onboardingLink = await createSellerOnboardingLink(account.id);
    return NextResponse.redirect(onboardingLink.url);
  } catch {
    return settingsRedirect("error");
  }
}
