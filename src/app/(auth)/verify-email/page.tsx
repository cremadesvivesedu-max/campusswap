import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getOptionalAuthUser } from "@/lib/auth/server";
import { getCurrentUser } from "@/server/queries/marketplace";
import { isLiveMode } from "@/lib/env";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const authUser = await getOptionalAuthUser();
  const currentUser = authUser && isLiveMode ? await getCurrentUser() : null;
  const isVerified = currentUser?.verificationStatus === "verified";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Verify email"
        title="Check your inbox and confirm your student status."
        description="Supported student domains can auto-verify, while custom cases stay reviewable in admin settings."
      />
      <Card className="bg-white">
        <CardHeader>
          <Badge className="bg-emerald-100 text-emerald-900">
            Verification flow
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
          <p>1. We send a one-time code to the supplied student email.</p>
          <p>
            2. Once confirmed, the verified badge appears on your profile and listings.
          </p>
          <p>
            3. Admin rules can optionally gate posting or messaging until verification
            succeeds.
          </p>
          {params.email ? (
            <p className="font-medium text-slate-950">
              Verification email target: {params.email}
            </p>
          ) : null}
          <Button asChild type="button">
            <Link href={isVerified ? "/onboarding" : authUser ? "/onboarding" : "/login"}>
              {isVerified ? "Continue to onboarding" : "Open onboarding"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
