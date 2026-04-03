"use client";

import { useActionState } from "react";
import { joinWaitlistAction } from "@/server/actions/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaitlistForm() {
  const [state, action] = useActionState(joinWaitlistAction, { success: false, message: "" });

  return (
    <form action={action} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow">
      <Input name="email" type="email" placeholder="student@maastrichtuniversity.nl" />
      <select name="intent" className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900">
        <option value="both">Buying and selling</option>
        <option value="buyer">Mostly buying</option>
        <option value="seller">Mostly selling</option>
      </select>
      <Button className="w-full" type="submit">Join waitlist</Button>
      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
    </form>
  );
}
