"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Megaphone, Search, Sparkles, MessageSquareText } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  getNotificationPreferenceDescription,
  getNotificationPreferenceLabel
} from "@/lib/i18n-shared";
import { updateNotificationPreferencesAction } from "@/server/actions/forms";

const notificationOptions = [
  { id: "messages", icon: MessageSquareText },
  { id: "listing_updates", icon: Bell },
  { id: "saved_searches", icon: Search },
  { id: "featured_digest", icon: Sparkles },
  { id: "promotions", icon: Megaphone }
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  const { dictionary } = useLocale();

  return (
    <Button className="w-full sm:w-auto" type="submit" disabled={pending}>
      {pending
        ? dictionary.settings.savingPreferences
        : dictionary.settings.savePreferences}
    </Button>
  );
}

export function SettingsNotificationPreferencesForm({
  initialPreferences
}: {
  initialPreferences: string[];
}) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const [selected, setSelected] = useState<string[]>(initialPreferences);
  const [state, action] = useActionState(updateNotificationPreferencesAction, {
    success: false,
    message: ""
  });

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  const feedback = state.success
    ? dictionary.settings.notificationsSaved
    : state.message;

  return (
    <form action={action} className="space-y-5">
      <p className="text-sm leading-6 text-slate-600">
        {dictionary.settings.notificationsDescription}
      </p>

      <div className="grid gap-3">
        {notificationOptions.map((option) => {
          const checked = selected.includes(option.id);
          const Icon = option.icon;

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-4 rounded-[24px] border p-4 transition ${
                checked
                  ? "border-slate-950 bg-slate-950 text-white shadow-glow"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <input
                type="checkbox"
                name="notificationPreferences"
                value={option.id}
                checked={checked}
                onChange={(event) => {
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, option.id]
                      : current.filter((value) => value !== option.id)
                  );
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <div
                className={`rounded-2xl p-2 ${
                  checked ? "bg-white/10 text-white" : "bg-white text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${checked ? "text-white" : "text-slate-950"}`}>
                  {getNotificationPreferenceLabel(dictionary, option.id)}
                </p>
                <p
                  className={`mt-1 text-sm leading-6 ${
                    checked ? "text-slate-200" : "text-slate-600"
                  }`}
                >
                  {getNotificationPreferenceDescription(dictionary, option.id)}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm font-medium ${
            state.success ? "text-emerald-700" : state.message ? "text-rose-700" : "text-slate-500"
          }`}
        >
          {feedback || "\u00A0"}
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
