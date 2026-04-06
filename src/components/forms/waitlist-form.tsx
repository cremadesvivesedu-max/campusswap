"use client";

import { useActionState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { joinWaitlistAction } from "@/server/actions/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaitlistForm() {
  const { dictionary } = useLocale();
  const [state, action] = useActionState(joinWaitlistAction, {
    success: false,
    message: ""
  });

  return (
    <form
      action={action}
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow"
    >
      <Input
        name="email"
        type="email"
        placeholder={dictionary.marketing.home.waitlist.emailPlaceholder}
      />
      <select
        name="intent"
        className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900"
      >
        <option value="both">{dictionary.marketing.home.waitlist.both}</option>
        <option value="buyer">{dictionary.marketing.home.waitlist.buyer}</option>
        <option value="seller">{dictionary.marketing.home.waitlist.seller}</option>
      </select>
      <Button className="w-full" type="submit">
        {dictionary.marketing.home.waitlist.submit}
      </Button>
      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
    </form>
  );
}
