import type Stripe from "stripe";
import { buildSiteUrl } from "@/lib/site-url";
import { stripe } from "@/lib/payments/stripe";
import type { SellerStripeConnectStatus } from "@/types/domain";

export interface StripeConnectAccountFlags {
  accountId?: string | null;
  detailsSubmitted?: boolean | null;
  chargesEnabled?: boolean | null;
  transfersEnabled?: boolean | null;
  payoutsEnabled?: boolean | null;
}

export function getSellerStripeConnectStatus(
  flags: StripeConnectAccountFlags
): SellerStripeConnectStatus {
  const connected = Boolean(flags.accountId);
  const detailsSubmitted = Boolean(flags.detailsSubmitted);
  const chargesEnabled = Boolean(flags.chargesEnabled);
  const transfersEnabled = Boolean(flags.transfersEnabled);
  const payoutsEnabled = Boolean(flags.payoutsEnabled);

  return {
    connected,
    detailsSubmitted,
    chargesEnabled,
    transfersEnabled,
    payoutsEnabled,
    onboardingComplete:
      connected && detailsSubmitted && transfersEnabled && payoutsEnabled
  };
}

export function getSellerStripeConnectStatusFromAccount(
  account: Stripe.Account
): SellerStripeConnectStatus {
  return getSellerStripeConnectStatus({
    accountId: account.id,
    detailsSubmitted: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    transfersEnabled: account.capabilities?.transfers === "active",
    payoutsEnabled: account.payouts_enabled
  });
}

export async function createSellerConnectedAccount(input: { email: string }) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  return stripe.accounts.create({
    type: "express",
    email: input.email,
    capabilities: {
      transfers: { requested: true }
    }
  });
}

export async function createSellerOnboardingLink(accountId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: buildSiteUrl("/connect/onboarding/refresh"),
    return_url: buildSiteUrl("/connect/onboarding/return"),
    type: "account_onboarding"
  });
}

export async function createSellerDashboardLink(accountId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  return stripe.accounts.createLoginLink(accountId);
}

export async function retrieveSellerConnectedAccount(accountId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  return stripe.accounts.retrieve(accountId);
}
