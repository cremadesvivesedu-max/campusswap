"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
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
  const { dictionary } = useLocale();
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
      className="space-y-6 rounded-[30px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-7"
    >
      <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
        {dictionary.auth.onboarding.notice}
      </div>
      <Input
        name="fullName"
        placeholder={dictionary.auth.onboarding.fullName}
        defaultValue={user.profile.fullName}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <select
          name="studentStatus"
          defaultValue={user.profile.studentStatus}
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900"
        >
          <option value="incoming">{dictionary.auth.onboarding.status.incoming}</option>
          <option value="current">{dictionary.auth.onboarding.status.current}</option>
          <option value="outgoing">{dictionary.auth.onboarding.status.outgoing}</option>
          <option value="graduated">{dictionary.auth.onboarding.status.graduated}</option>
        </select>
        <Input
          name="neighborhood"
          placeholder={dictionary.auth.onboarding.neighborhood}
          defaultValue={user.profile.neighborhood}
        />
      </div>
      <Textarea
        name="bio"
        placeholder={dictionary.auth.onboarding.bio}
        defaultValue={user.profile.bio}
      />
      <div className="space-y-3 rounded-[24px] border border-slate-200/80 bg-slate-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {dictionary.auth.onboarding.preferredCategories}
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
        <label className="rounded-[24px] border border-border bg-slate-50/70 p-4 text-sm">
          <input
            className="mr-2"
            type="checkbox"
            name="buyerIntent"
            defaultChecked={user.profile.buyerIntent}
          />
          {dictionary.auth.onboarding.buyerIntent}
        </label>
        <label className="rounded-[24px] border border-border bg-slate-50/70 p-4 text-sm">
          <input
            className="mr-2"
            type="checkbox"
            name="sellerIntent"
            defaultChecked={user.profile.sellerIntent}
          />
          {dictionary.auth.onboarding.sellerIntent}
        </label>
      </div>
      <div className="space-y-3 rounded-[24px] border border-slate-200/80 bg-slate-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {dictionary.auth.onboarding.notifications}
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
              {option.id === "messages"
                ? dictionary.auth.onboarding.notificationOptions.messages
                : option.id === "listing_updates"
                  ? dictionary.auth.onboarding.notificationOptions.listingUpdates
                  : option.id === "saved_searches"
                    ? dictionary.auth.onboarding.notificationOptions.savedSearches
                    : dictionary.auth.onboarding.notificationOptions.featuredDigest}
            </label>
          ))}
        </div>
      </div>
      <Button className="w-full" type="submit">
        {dictionary.auth.onboarding.save}
      </Button>
      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
    </form>
  );
}
