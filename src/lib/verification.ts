import type { AllowedEmailDomain, VerificationStatus } from "@/types/domain";

export function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

export function resolveVerificationStatus(
  email: string,
  allowedDomains: Pick<AllowedEmailDomain, "domain" | "autoVerify">[]
): VerificationStatus {
  const emailDomain = getEmailDomain(email);
  const matchingDomain = allowedDomains.find(
    (domain) => domain.domain.trim().toLowerCase() === emailDomain
  );

  if (!matchingDomain) {
    return "unverified";
  }

  return matchingDomain.autoVerify ? "verified" : "pending";
}

export function getVerificationStatusLabel(status: VerificationStatus) {
  switch (status) {
    case "verified":
      return "Verified";
    case "pending":
      return "Pending verification";
    case "unverified":
    default:
      return "Unverified";
  }
}

export function getVerificationStatusDescription(status: VerificationStatus) {
  switch (status) {
    case "verified":
      return "Your student badge is visible across CampusSwap.";
    case "pending":
      return "Your account is already live while student verification is still being checked.";
    case "unverified":
    default:
      return "You can use CampusSwap now, and add student verification later for a stronger trust signal.";
  }
}
