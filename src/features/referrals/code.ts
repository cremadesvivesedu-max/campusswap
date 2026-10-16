// Short invite codes derived from the user id (same formula as the database column).
export const REFERRAL_COOKIE = "cs_ref";

export function referralCodeFor(userId: string) {
  return userId.replace(/-/g, "").slice(0, 8).toLowerCase();
}

export function isReferralCode(value: string | null | undefined): value is string {
  return Boolean(value && /^[a-f0-9]{8}$/i.test(value));
}

/** "Lina Vermeer" -> "Lina V." so the leaderboard never shows full names. */
export function shortName(fullName: string) {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first || "Student";
}
