import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { VerificationStatusBadge } from "@/components/shared/verification-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getVerificationStatusDescription } from "@/lib/verification";
import type { User } from "@/types/domain";

interface VerificationPromptCardProps {
  user: User;
}

export function VerificationPromptCard({
  user
}: VerificationPromptCardProps) {
  if (user.verificationStatus === "verified") {
    return null;
  }

  const title =
    user.verificationStatus === "pending"
      ? "Your student status is pending, but your account is already active."
      : "You are inside CampusSwap as an unverified member.";
  const detail =
    user.verificationStatus === "pending"
      ? "Keep browsing, saving, messaging, and listing items while CampusSwap finishes the trust check."
      : "You can browse, save, message, and create listings now. A supported university email adds a stronger student-trust badge.";

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-700" />
            <p className="font-semibold text-slate-950">{title}</p>
            <VerificationStatusBadge status={user.verificationStatus} />
          </div>
          <p className="text-sm leading-6 text-slate-700">{detail}</p>
          <p className="text-sm leading-6 text-slate-600">
            {getVerificationStatusDescription(user.verificationStatus)}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/verify-email">Review verification status</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
