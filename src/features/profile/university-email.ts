// Rules for verifying a university email address after sign-up
// (for people who joined with Gmail, Google login, etc.).

export const CODE_TTL_MINUTES = 15;
export const MAX_CODE_ATTEMPTS = 5;
export const RESEND_AFTER_SECONDS = 60;

/** Lower-cases and checks the shape of an address; null if it is not one. */
export function normalizeUniversityEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(email)) {
    return null;
  }
  return email;
}
