"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-20 text-center">
      <h1 className="font-display text-4xl font-semibold text-slate-950">Something went wrong.</h1>
      <p className="text-sm leading-7 text-slate-600">CampusSwap hit an unexpected error. Try the action again or return to a safer route.</p>
      <Button onClick={reset} type="button">Try again</Button>
    </div>
  );
}
