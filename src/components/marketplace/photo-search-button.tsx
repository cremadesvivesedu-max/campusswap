"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { proposeFromPredictions, type PhotoLocale } from "@/features/listings/photo-recognition";

/**
 * Search with a photo: the same on-device model that proposes titles when selling looks at
 * the picture and fills the search with what it sees (and its category). Nothing is uploaded.
 */
export function PhotoSearchButton({
  categories,
  onFound
}: {
  categories: string[];
  onFound: (query: string, categorySlug: string) => void;
}) {
  const { dictionary } = useLocale();
  const copy = dictionary.innov.photoSearch;
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        aria-label={copy.button}
        title={copy.button}
      >
        <Camera className="h-5 w-5" aria-hidden="true" />
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (!file) return;
          setBusy(true);
          setStatus({ text: copy.looking, ok: true });
          try {
            const { classifyPhoto } = await import("@/features/listings/photo-classifier");
            const predictions = await classifyPhoto(file);
            const proposal = proposeFromPredictions(
              predictions,
              (dictionary.localeCode as PhotoLocale) ?? "en",
              categories,
              // Lower bar than when selling: a wrong guess only fills the search box, easy to fix.
              0.05
            );
            if (!proposal) {
              setStatus({ text: copy.notFound, ok: false });
              return;
            }
            onFound(proposal.title, proposal.category);
            setStatus({ text: copy.found.replace("{title}", proposal.title), ok: true });
          } catch {
            setStatus({ text: copy.notFound, ok: false });
          } finally {
            setBusy(false);
          }
        }}
      />
      {status ? (
        <p
          className={`basis-full text-sm ${status.ok ? "text-slate-600" : "text-rose-700"}`}
          role="status"
        >
          {status.text}
        </p>
      ) : null}
    </>
  );
}
