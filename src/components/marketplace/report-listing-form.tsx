"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitListingReportAction } from "@/server/actions/marketplace";

const initialState = {
  success: false,
  message: ""
};

export function ReportListingForm({ listingId }: { listingId: string }) {
  const [state, formAction, pending] = useActionState(
    submitListingReportAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-3 rounded-[24px] border border-rose-200 bg-rose-50 p-4">
      <input type="hidden" name="listingId" value={listingId} />
      <div className="flex items-center gap-2 text-sm font-semibold text-rose-950">
        <AlertTriangle className="h-4 w-4" />
        Report this listing
      </div>
      <Textarea
        name="reason"
        placeholder="Tell CampusSwap moderation what feels inaccurate, unsafe, or suspicious."
        className="min-h-[104px] border-rose-200 bg-white"
      />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Sending..." : "Submit report"}
      </Button>
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-700" : "text-rose-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
