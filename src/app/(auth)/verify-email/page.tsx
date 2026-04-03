import Link from "next/link";
import { VerificationStatusBadge } from "@/components/shared/verification-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getOptionalAuthUser } from "@/lib/auth/server";
import { getAllowedEmailDomains, getCurrentUser } from "@/server/queries/marketplace";
import { getVerificationStatusDescription } from "@/lib/verification";
import { isLiveMode } from "@/lib/env";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const authUser = await getOptionalAuthUser();
  const [currentUser, allowedDomains] = await Promise.all([
    authUser && isLiveMode ? getCurrentUser() : Promise.resolve(null),
    getAllowedEmailDomains()
  ]);
  const isVerified = currentUser?.verificationStatus === "verified";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Verify email"
        title="Student verification is optional, but it strengthens trust."
        description="You can already enter CampusSwap. Supported university domains can auto-verify or move into a pending-review trust state without blocking the rest of the app."
      />
      <Card className="bg-white">
        <CardHeader>
          {currentUser ? (
            <div className="flex items-center gap-3">
              <VerificationStatusBadge status={currentUser.verificationStatus} />
              <p className="text-sm text-slate-600">
                {getVerificationStatusDescription(currentUser.verificationStatus)}
              </p>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
          <p>1. Any valid email can create and access a CampusSwap account.</p>
          <p>
            2. Supported student domains can unlock a verified badge or a pending-verification trust state.
          </p>
          <p>
            3. Verification stays visible on your profile, listings, and conversations, but it does not block basic app access.
          </p>
          <p>Supported student domains: {allowedDomains.map((domain) => domain.domain).join(", ")}</p>
          {params.email ? (
            <p className="font-medium text-slate-950">
              Account email: {params.email}
            </p>
          ) : null}
          <Button asChild type="button">
            <Link href={authUser ? "/app" : "/login"}>
              {isVerified ? "Open the app" : "Continue into CampusSwap"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
