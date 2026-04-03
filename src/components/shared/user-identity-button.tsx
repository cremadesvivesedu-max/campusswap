"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import type { User } from "@/types/domain";

interface UserIdentityButtonProps {
  user: User;
}

export function UserIdentityButton({ user }: UserIdentityButtonProps) {
  return (
    <Link
      href="/app/profile"
      className="inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 transition hover:border-emerald-300 hover:bg-emerald-100"
      aria-label="Open your profile"
    >
      <ProfileAvatar
        userId={user.id}
        name={user.profile.fullName}
        src={user.avatar}
        className="h-10 w-10"
      />
      <span className="hidden text-left sm:block">
        <span className="block text-sm font-semibold text-emerald-950">{user.profile.fullName}</span>
        <span className="block text-xs text-emerald-800">{user.verificationStatus}</span>
      </span>
      <ChevronDown className="hidden h-4 w-4 text-emerald-900 sm:block" />
    </Link>
  );
}
