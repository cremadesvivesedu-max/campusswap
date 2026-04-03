"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveOnboardingAction } from "@/server/actions/forms";
import type { Category, User } from "@/types/domain";

interface OnboardingFormProps {
  user: User;
  categories: Category[];
}

const notificationOptions = [
  { id: "messages", label: "Message updates" },
  { id: "listing_updates", label: "Listing updates" },
  { id: "saved_searches", label: "Saved-search alerts" },
  { id: "featured_digest", label: "Featured digest" }
];

export function OnboardingForm({ user, categories }: OnboardingFormProps) {
  const router = useRouter();
  const [state, action] = useActionState(saveOnboardingAction, {
    success: false,
    message: ""
  });

  useEffect(() => {
    if (state.success) {
      router.replace("/app");
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form
      action={action}
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow"
    >
      <Input
        name="fullName"
        placeholder="Your full name"
        defaultValue={user.profile.fullName}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <select
          name="studentStatus"
          defaultValue={user.profile.studentStatus}
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900"
        >
          <option value="incoming">Incoming</option>
          <option value="current">Current</option>
          <option value="outgoing">Outgoing</option>
          <option value="graduated">Graduated</option>
        </select>
        <Input
          name="neighborhood"
          placeholder="Preferred pickup area"
          defaultValue={user.profile.neighborhood}
        />
      </div>
      <Textarea
        name="bio"
        placeholder="Tell buyers and sellers what you are looking for"
        defaultValue={user.profile.bio}
      />
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Preferred categories
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="rounded-2xl border border-border bg-slate-50 p-4 text-sm"
            >
              <input
                className="mr-2"
                type="checkbox"
                name="preferredCategories"
                value={category.slug}
                defaultChecked={user.profile.preferredCategories.includes(category.slug)}
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input
            className="mr-2"
            type="checkbox"
            name="buyerIntent"
            defaultChecked={user.profile.buyerIntent}
          />
          Buyer intent
        </label>
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input
            className="mr-2"
            type="checkbox"
            name="sellerIntent"
            defaultChecked={user.profile.sellerIntent}
          />
          Seller intent
        </label>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Notifications
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {notificationOptions.map((option) => (
            <label
              key={option.id}
              className="rounded-2xl border border-border bg-slate-50 p-4 text-sm"
            >
              <input
                className="mr-2"
                type="checkbox"
                name="notificationPreferences"
                value={option.id}
                defaultChecked={user.profile.notificationPreferences.includes(option.id)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      <Button className="w-full" type="submit">
        Save onboarding
      </Button>
      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
    </form>
  );
}
