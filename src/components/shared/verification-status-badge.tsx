"use client";

import { Badge } from "@/components/ui/badge";
import { getVerificationStatusLabel } from "@/lib/verification";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/domain";

interface VerificationStatusBadgeProps {
  status: VerificationStatus;
  className?: string;
}

const statusClasses: Record<VerificationStatus, string> = {
  verified: "bg-emerald-100 text-emerald-900",
  pending: "bg-amber-100 text-amber-900",
  unverified: "bg-slate-100 text-slate-700"
};

export function VerificationStatusBadge({
  status,
  className
}: VerificationStatusBadgeProps) {
  return (
    <Badge className={cn(statusClasses[status], className)}>
      {getVerificationStatusLabel(status)}
    </Badge>
  );
}
