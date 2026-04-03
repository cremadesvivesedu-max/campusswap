"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isLiveMode } from "@/lib/env";
import { getCurrentUser } from "@/server/queries/marketplace";
import type { ListingStatus, ReportStatus } from "@/types/domain";

interface AdminActionResult {
  success: boolean;
  message: string;
}

async function requireAdminActionContext() {
  const adminUser = await getCurrentUser();

  if (adminUser.role !== "admin") {
    throw new Error("Admin access is required for this action.");
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured for admin actions.");
  }

  return { adminUser, supabase };
}

export async function updateAdminListingAction(
  formData: FormData
): Promise<void> {
  const listingId = String(formData.get("listingId") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim() as ListingStatus;
  const featured = formData.get("featured") === "on";
  const outlet = formData.get("outlet") === "on";

  if (!isLiveMode) {
    return;
  }

  const { supabase } = await requireAdminActionContext();
  const { error } = await supabase
    .from("listings")
    .update({
      status,
      featured,
      outlet,
      updated_at: new Date().toISOString()
    })
    .eq("id", listingId);

  if (error) {
    return;
  }

  revalidatePath("/admin/listings");
  revalidatePath("/app");
  revalidatePath(`/app/listings/${listingId}`);

  return;
}

export async function updateReportStatusAction(
  formData: FormData
): Promise<void> {
  const reportId = String(formData.get("reportId") ?? "").trim();
  const status = String(formData.get("status") ?? "open").trim() as ReportStatus;
  const note = String(formData.get("note") ?? "").trim();
  const targetType = String(formData.get("targetType") ?? "").trim();
  const targetId = String(formData.get("targetId") ?? "").trim();

  if (!isLiveMode) {
    return;
  }

  const { adminUser, supabase } = await requireAdminActionContext();
  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);

  if (error) {
    return;
  }

  if (note) {
    await supabase.from("moderation_actions").insert({
      report_id: reportId,
      actor_id: adminUser.id,
      action: note
    });
  }

  await supabase.from("audit_logs").insert({
    actor_id: adminUser.id,
    entity: "report",
    entity_id: reportId,
    action: `status:${status}`
  });

  if (targetType === "listing" && targetId && status === "actioned") {
    await supabase
      .from("listings")
      .update({ status: "hidden", updated_at: new Date().toISOString() })
      .eq("id", targetId);
  }

  revalidatePath("/admin/reports");
  revalidatePath("/admin/listings");
  revalidatePath("/app");

  return;
}

export async function updateCategoryAction(
  formData: FormData
): Promise<void> {
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!isLiveMode) {
    return;
  }

  const { supabase } = await requireAdminActionContext();
  const { error } = await supabase
    .from("categories")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      short_description: String(formData.get("shortDescription") ?? "").trim(),
      hero_description: String(formData.get("heroDescription") ?? "").trim(),
      color: String(formData.get("color") ?? "").trim(),
      typical_price_range: String(formData.get("typicalPriceRange") ?? "").trim(),
      updated_at: new Date().toISOString()
    })
    .eq("id", categoryId);

  if (error) {
    return;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/app/search");

  return;
}

export async function updatePricingSettingAction(
  formData: FormData
): Promise<void> {
  const settingId = String(formData.get("settingId") ?? "").trim();
  const value = Number(formData.get("value") ?? 0);
  const active = formData.get("active") === "on";

  if (!isLiveMode) {
    return;
  }

  const { supabase } = await requireAdminActionContext();
  const { error } = await supabase
    .from("pricing_settings")
    .update({
      value,
      active,
      updated_at: new Date().toISOString()
    })
    .eq("id", settingId);

  if (error) {
    return;
  }

  revalidatePath("/admin/monetization");
  revalidatePath("/app");

  return;
}

export async function updateContentBlockAction(
  formData: FormData
): Promise<void> {
  const blockId = String(formData.get("blockId") ?? "").trim();

  if (!isLiveMode) {
    return;
  }

  const { supabase } = await requireAdminActionContext();
  const { error } = await supabase
    .from("content_blocks")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      body: String(formData.get("body") ?? "").trim(),
      cta: String(formData.get("cta") ?? "").trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", blockId);

  if (error) {
    return;
  }

  revalidatePath("/admin/content");
  revalidatePath("/");

  return;
}

export async function updateSponsorPlacementAction(
  formData: FormData
): Promise<void> {
  const sponsorId = String(formData.get("sponsorId") ?? "").trim();

  if (!isLiveMode) {
    return;
  }

  const { supabase } = await requireAdminActionContext();
  const { error } = await supabase
    .from("sponsored_placements")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      label: String(formData.get("label") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      copy: String(formData.get("copy") ?? "").trim(),
      cta: String(formData.get("cta") ?? "").trim(),
      href: String(formData.get("href") ?? "").trim(),
      active: formData.get("active") === "on",
      updated_at: new Date().toISOString()
    })
    .eq("id", sponsorId);

  if (error) {
    return;
  }

  revalidatePath("/admin/sponsors");
  revalidatePath("/app");
  revalidatePath("/");

  return;
}

export async function updateAllowedDomainAction(
  formData: FormData
): Promise<void> {
  const domainId = String(formData.get("domainId") ?? "").trim();

  if (!isLiveMode) {
    return;
  }

  const { supabase } = await requireAdminActionContext();
  const { error } = await supabase
    .from("allowed_email_domains")
    .update({
      domain: String(formData.get("domain") ?? "").trim().toLowerCase(),
      auto_verify: formData.get("autoVerify") === "on",
      updated_at: new Date().toISOString()
    })
    .eq("id", domainId);

  if (error) {
    return;
  }

  revalidatePath("/admin/settings");
  revalidatePath("/signup");

  return;
}

export async function updateVerificationRuleAction(
  formData: FormData
): Promise<void> {
  const ruleId = String(formData.get("ruleId") ?? "").trim();

  if (!isLiveMode) {
    return;
  }

  const { supabase } = await requireAdminActionContext();
  const { error } = await supabase
    .from("university_verification_rules")
    .update({
      require_email_otp: formData.get("requireEmailOtp") === "on",
      block_posting_until_verified: formData.get("blockPostingUntilVerified") === "on",
      block_messaging_until_verified: formData.get("blockMessagingUntilVerified") === "on",
      notes: String(formData.get("notes") ?? "").trim(),
      updated_at: new Date().toISOString()
    })
    .eq("id", ruleId);

  if (error) {
    return;
  }

  revalidatePath("/admin/settings");
  revalidatePath("/signup");

  return;
}
