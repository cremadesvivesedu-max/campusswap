import Link from "next/link";
import { VerificationStatusBadge } from "@/components/shared/verification-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getOptionalAuthUser } from "@/lib/auth/server";
import { getDictionaryForRequest } from "@/lib/i18n";
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
  const [currentUser, allowedDomains, dictionary] = await Promise.all([
    authUser && isLiveMode ? getCurrentUser() : Promise.resolve(null),
    getAllowedEmailDomains(),
    getDictionaryForRequest()
  ]);
  const isVerified = currentUser?.verificationStatus === "verified";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-6 sm:px-8 sm:py-8">
      <SectionHeading
        eyebrow={dictionary.auth.verifyEmail.eyebrow}
        title={dictionary.auth.verifyEmail.title}
        description={dictionary.auth.verifyEmail.description}
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
          {dictionary.auth.verifyEmail.rules.map((rule, index) => (
            <p key={rule}>
              {index + 1}. {rule}
            </p>
          ))}
          <p>
            {dictionary.auth.verifyEmail.supportedDomains}:{" "}
            {allowedDomains.map((domain) => domain.domain).join(", ")}
          </p>
          {params.email ? (
            <p className="font-medium text-slate-950">
              {dictionary.auth.verifyEmail.accountEmail}: {params.email}
            </p>
          ) : null}
          <Button asChild type="button">
            <Link href={authUser ? "/app" : "/login"}>
              {isVerified
                ? dictionary.auth.verifyEmail.openApp
                : dictionary.auth.verifyEmail.continueIntoApp}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
