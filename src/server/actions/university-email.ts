"use server";

import { createHash, randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/email/resend";
import { env, isLiveMode } from "@/lib/env";
import { getDictionaryForRequest } from "@/lib/i18n";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/server/queries/marketplace";
import {
  CODE_TTL_MINUTES,
  MAX_CODE_ATTEMPTS,
  RESEND_AFTER_SECONDS,
  normalizeUniversityEmail
} from "@/features/profile/university-email";

export type UniversityEmailResult = {
  success: boolean;
  /** Key in dictionary.uniVerify, so the form can show it in the right language. */
  message:
    | ""
    | "codeSent"
    | "verified"
    | "invalidEmail"
    | "notUniversity"
    | "alreadyUsed"
    | "tooSoon"
    | "wrongCode"
    | "expired"
    | "tooManyAttempts"
    | "unavailable";
  email?: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function codeHash(userId: string, code: string) {
  return sha256(`${userId}:${code}`);
}

/** Step 1: email a 6-digit code to the university address. */
export async function sendUniversityCodeAction(
  _: UniversityEmailResult,
  formData: FormData
): Promise<UniversityEmailResult> {
  const email = normalizeUniversityEmail(String(formData.get("email") ?? ""));
  if (!email) return { success: false, message: "invalidEmail" };

  const admin = createAdminSupabaseClient();
  if (!isLiveMode || !admin || !resend) return { success: false, message: "unavailable" };

  const user = await getCurrentUser();
  const domain = email.split("@")[1];

  const { data: allowed } = await admin
    .from("allowed_email_domains")
    .select("domain")
    .eq("domain", domain)
    .maybeSingle();
  if (!allowed) return { success: false, message: "notUniversity" };

  const { data: taken } = await admin
    .from("users")
    .select("id")
    .eq("university_email_sha256", sha256(email))
    .neq("id", user.id)
    .maybeSingle();
  if (taken) return { success: false, message: "alreadyUsed" };

  const { data: previous } = await admin
    .from("university_email_codes")
    .select("sent_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (previous && Date.now() - new Date(previous.sent_at).getTime() < RESEND_AFTER_SECONDS * 1000) {
    return { success: false, message: "tooSoon", email };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const { error } = await admin.from("university_email_codes").upsert({
    user_id: user.id,
    email,
    code_sha256: codeHash(user.id, code),
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
    attempts: 0,
    sent_at: new Date().toISOString()
  });
  if (error) return { success: false, message: "unavailable" };

  const copy = (await getDictionaryForRequest()).uniVerify;
  const body = copy.emailBody.replace("{minutes}", String(CODE_TTL_MINUTES));
  const { error: sendError } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: copy.emailSubject.replace("{code}", code),
    text: `${body}\n\n${code}\n\n${copy.emailIgnore}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#203860;line-height:1.5">
<p>${body}</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#203860">${code}</p>
<p style="color:#64748b;font-size:13px">${copy.emailIgnore}</p></div>`
  });
  if (sendError) return { success: false, message: "unavailable" };

  return { success: true, message: "codeSent", email };
}

/** Step 2: check the code and give the verified badge. */
export async function confirmUniversityCodeAction(
  _: UniversityEmailResult,
  formData: FormData
): Promise<UniversityEmailResult> {
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  const admin = createAdminSupabaseClient();
  if (!isLiveMode || !admin) return { success: false, message: "unavailable" };

  const user = await getCurrentUser();
  const { data: row } = await admin
    .from("university_email_codes")
    .select("email, code_sha256, expires_at, attempts")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) return { success: false, message: "expired" };
  const email = row.email as string;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await admin.from("university_email_codes").delete().eq("user_id", user.id);
    return { success: false, message: "expired" };
  }
  if (row.attempts >= MAX_CODE_ATTEMPTS) return { success: false, message: "tooManyAttempts", email };

  if (code.length !== 6 || codeHash(user.id, code) !== row.code_sha256) {
    await admin
      .from("university_email_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("user_id", user.id);
    return {
      success: false,
      message: row.attempts + 1 >= MAX_CODE_ATTEMPTS ? "tooManyAttempts" : "wrongCode",
      email
    };
  }

  const { data: domain } = await admin
    .from("allowed_email_domains")
    .select("university_id")
    .eq("domain", email.split("@")[1])
    .maybeSingle();

  const { error } = await admin
    .from("users")
    .update({
      verification_status: "verified",
      university_email_sha256: sha256(email),
      university_verified_at: new Date().toISOString(),
      ...(domain?.university_id ? { university_id: domain.university_id } : {})
    })
    .eq("id", user.id);
  // The unique index refuses a university address already used by another account.
  if (error) return { success: false, message: error.code === "23505" ? "alreadyUsed" : "unavailable" };

  await admin.from("profiles").update({ verified_badge: true }).eq("user_id", user.id);
  // We only needed the address to send the code: forget it now.
  await admin.from("university_email_codes").delete().eq("user_id", user.id);

  revalidatePath("/app", "layout");
  return { success: true, message: "verified" };
}
