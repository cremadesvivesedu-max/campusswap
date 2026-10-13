"use server";

import { revalidatePath } from "next/cache";
import { isLiveMode } from "@/lib/env";
import { MOVE_OUT_METADATA_KEY, parseMoveOutDate } from "@/features/profile/moving-sale";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/server/queries/marketplace";

// GDPR self-service: download your data and delete your account.

type AccountResult = { ok: true; json?: string } | { ok: false; message: string };

// Every table that holds rows about a person, and the column that points to them.
const personalData: [table: string, column: string][] = [
  ["users", "id"],
  ["profiles", "user_id"],
  ["listings", "seller_id"],
  ["conversations", "buyer_id"],
  ["conversations", "seller_id"],
  ["messages", "sender_id"],
  ["transactions", "buyer_id"],
  ["transactions", "seller_id"],
  ["listing_offers", "buyer_id"],
  ["listing_offers", "seller_id"],
  ["reviews", "author_id"],
  ["reviews", "target_user_id"],
  ["favorites", "user_id"],
  ["saved_searches", "user_id"],
  ["push_subscriptions", "user_id"],
  ["notifications", "user_id"],
  ["reports", "reporter_id"],
  ["support_tickets", "user_id"],
  ["app_events", "actor_user_id"]
];

export async function exportMyDataAction(): Promise<AccountResult> {
  const user = await getCurrentUser();

  if (!isLiveMode) {
    return { ok: true, json: JSON.stringify({ demo: true, user }, null, 2) };
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return { ok: false, message: "Data export is not configured yet." };
  }

  const exported: Record<string, unknown[]> = {};
  for (const [table, column] of personalData) {
    const { data, error } = await admin.from(table).select("*").eq(column, user.id).limit(5000);
    if (error) {
      continue;
    }
    exported[`${table}.${column}`] = data ?? [];
  }

  // Profile details kept on the auth account itself (for example the moving day).
  const { data: authData } = await admin.auth.admin.getUserById(user.id);
  exported["auth.user_metadata"] = authData?.user ? [authData.user.user_metadata ?? {}] : [];

  return {
    ok: true,
    json: JSON.stringify({ exportedAt: new Date().toISOString(), userId: user.id, data: exported }, null, 2)
  };
}

export async function deleteMyAccountAction(confirmation: string, expectedWord: string): Promise<AccountResult> {
  if (confirmation.trim().toUpperCase() !== expectedWord.toUpperCase()) {
    return { ok: false, message: expectedWord };
  }

  const user = await getCurrentUser();

  if (!isLiveMode) {
    return { ok: true };
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return { ok: false, message: "Account deletion is not configured yet." };
  }

  const now = new Date().toISOString();
  const anonymousEmail = `deleted-${user.id}@deleted.campusswap.invalid`;

  // Rows other people rely on (chats, sales, reviews) stay, without anything that identifies the person.
  const steps = [
    admin
      .from("listings")
      .update({ status: "archived", removed_at: now })
      .eq("seller_id", user.id)
      .in("status", ["active", "reserved", "pending-review", "hidden"]),
    admin
      .from("profiles")
      .update({
        full_name: "Deleted user",
        bio: "",
        neighborhood: "",
        notification_preferences: [],
        preferred_categories: []
      })
      .eq("user_id", user.id),
    admin.from("users").update({ email: anonymousEmail, avatar_url: null }).eq("id", user.id),
    admin.from("favorites").delete().eq("user_id", user.id),
    admin.from("saved_searches").delete().eq("user_id", user.id),
    admin.from("notifications").delete().eq("user_id", user.id)
  ];

  for (const step of steps) {
    const { error } = await step;
    if (error) {
      console.error("account deletion step failed", error);
      return { ok: false, message: "We could not delete your account. Contact support and we will do it by hand." };
    }
  }

  // Soft delete keeps the auth row (other tables point at it) but removes the login and identifiers.
  const { error: authError } = await admin.auth.admin.deleteUser(user.id, true);
  if (authError) {
    console.error("auth soft delete failed", authError);
    return { ok: false, message: "We could not delete your account. Contact support and we will do it by hand." };
  }

  const supabase = await createServerSupabaseClient();
  await supabase?.auth.signOut();

  return { ok: true };
}

type MoveOutResult = { success: boolean; message: string; moveOutDate?: string | null };

/** Save or clear the seller's moving day (kept in auth user metadata, no schema change). */
export async function updateMoveOutDateAction(
  _: MoveOutResult,
  formData: FormData
): Promise<MoveOutResult> {
  const clearing = formData.get("intent") === "clear";
  const moveOutDate = clearing ? null : parseMoveOutDate(formData.get("moveOutDate"));

  if (!clearing && !moveOutDate) {
    return { success: false, message: "invalid-date" };
  }

  if (!isLiveMode) {
    return { success: true, message: clearing ? "cleared" : "saved", moveOutDate };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, message: "Supabase is not configured." };
  }

  const { error } = await supabase.auth.updateUser({
    data: { [MOVE_OUT_METADATA_KEY]: moveOutDate }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/app/my-listings");
  return { success: true, message: clearing ? "cleared" : "saved", moveOutDate };
}
