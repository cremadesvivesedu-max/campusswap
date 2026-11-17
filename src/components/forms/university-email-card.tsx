"use client";

import { useActionState, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  confirmUniversityCodeAction,
  sendUniversityCodeAction,
  type UniversityEmailResult
} from "@/server/actions/university-email";

const initial: UniversityEmailResult = { success: false, message: "" };

export function UniversityEmailCard({ verified }: { verified: boolean }) {
  const { dictionary } = useLocale();
  const copy = dictionary.uniVerify;
  const [sendState, sendAction, sending] = useActionState(sendUniversityCodeAction, initial);
  const [confirmState, confirmAction, confirming] = useActionState(confirmUniversityCodeAction, initial);
  const [changeEmail, setChangeEmail] = useState(false);

  if (verified || confirmState.message === "verified") {
    return (
      <p id="university-email" className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 font-medium text-emerald-900">
        <BadgeCheck className="h-5 w-5" aria-hidden="true" />
        {copy.verified}
      </p>
    );
  }

  const codeStep = Boolean(sendState.email) && sendState.message !== "notUniversity" && !changeEmail;
  const message = (confirmState.message || sendState.message) as keyof typeof copy | "";

  return (
    <div id="university-email" className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-semibold text-slate-900">{copy.title}</p>
      <p>{copy.body}</p>
      {codeStep ? (
        <form action={confirmAction} className="space-y-2">
          <p className="text-xs text-slate-600">{copy.codeSentTo.replace("{email}", sendState.email ?? "")}</p>
          <Input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            required
            placeholder="123456"
            aria-label={copy.codeLabel}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={confirming}>
              {confirming ? copy.checking : copy.confirm}
            </Button>
            <Button type="button" variant="outline" onClick={() => setChangeEmail(true)}>
              {copy.otherEmail}
            </Button>
          </div>
        </form>
      ) : (
        <form action={(formData) => { setChangeEmail(false); sendAction(formData); }} className="space-y-2">
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@student.maastrichtuniversity.nl"
            aria-label={copy.emailLabel}
          />
          <Button type="submit" disabled={sending}>
            {sending ? copy.sending : copy.send}
          </Button>
        </form>
      )}
      {message && message !== "codeSent" && copy[message] ? (
        <p className={`text-xs ${message === "verified" ? "text-emerald-800" : "text-rose-700"}`} aria-live="polite">
          {copy[message]}
        </p>
      ) : null}
      <p className="text-xs text-slate-500">{copy.privacy}</p>
    </div>
  );
}
