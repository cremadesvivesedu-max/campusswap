"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { VerificationStatusBadge } from "@/components/shared/verification-status-badge";
import type { User } from "@/types/domain";

interface UserIdentityButtonProps {
  user: User;
}

export function UserIdentityButton({ user }: UserIdentityButtonProps) {
  return (
    <Link
      href="/app/profile"
      className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      aria-label="Open your profile"
    >
      <ProfileAvatar
        userId={user.id}
        name={user.profile.fullName}
        src={user.avatar}
        className="h-10 w-10"
      />
      <span className="hidden text-left sm:block">
        <span className="block text-sm font-semibold text-slate-950">{user.profile.fullName}</span>
        <span className="block pt-1">
          <VerificationStatusBadge status={user.verificationStatus} className="align-middle" />
        </span>
      </span>
      <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
    </Link>
  );
}
