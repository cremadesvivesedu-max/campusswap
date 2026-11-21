"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw, Sparkles, Wand2 } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

type Mode = "idle" | "working" | "tap" | "preview";

/**
 * Tools for the cover photo (the first one): improve, rotate and remove the background.
 * Works on the file input itself, so the form uploads the edited photo as usual.
 */
export function PhotoTools({
  inputRef,
  onFilesChanged
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFilesChanged: (files: File[]) => void;
}) {
  const { dictionary } = useLocale();
  const copy = dictionary.innov.photo;
  const [mode, setMode] = useState<Mode>("idle");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [original, setOriginal] = useState<File | null>(null);
  const [current, setCurrent] = useState<{ file: File; url: string } | null>(null);
  const [proposal, setProposal] = useState<{ file: File; url: string } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const files = () => Array.from(inputRef.current?.files ?? []);

  useEffect(() => {
    const first = files()[0];
    if (!first) return;
    const url = URL.createObjectURL(first);
    setCurrent({ file: first, url });
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function replaceFirst(file: File) {
    const input = inputRef.current;
    if (!input) return;
    const all = files();
    if (!original) setOriginal(all[0] ?? null);
    const transfer = new DataTransfer();
    [file, ...all.slice(1)].forEach((item) => transfer.items.add(item));
    input.files = transfer.files;
    setCurrent({ file, url: URL.createObjectURL(file) });
    onFilesChanged(Array.from(transfer.files));
  }

  async function run(task: () => Promise<File>, done: string) {
    setMode("working");
    setMessage(null);
    try {
      replaceFirst(await task());
      setMessage({ text: done, ok: true });
    } catch {
      setMessage({ text: copy.failed, ok: false });
    } finally {
      setMode("idle");
    }
  }

  if (!current) return null;

  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-4" aria-label={copy.tools}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={mode !== "idle"}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
          onClick={() =>
            run(async () => (await import("@/features/listings/photo-editing")).enhancePhoto(current.file), copy.improved)
          }
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" /> {mode === "working" ? copy.improving : copy.improve}
        </button>
        <button
          type="button"
          disabled={mode !== "idle"}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
          onClick={async () => {
            setMessage(null);
            setMode("tap");
            // Load the model while the seller looks for the item in the photo.
            void (await import("@/features/listings/photo-editing")).preloadBackgroundRemoval().catch(() => undefined);
          }}
        >
          <Wand2 className="h-4 w-4" aria-hidden="true" /> {copy.removeBg}
        </button>
        <button
          type="button"
          disabled={mode !== "idle"}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
          onClick={() => run(async () => (await import("@/features/listings/photo-editing")).rotatePhoto(current.file), copy.rotate)}
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" /> {copy.rotate}
        </button>
        {original ? (
          <button
            type="button"
            disabled={mode !== "idle"}
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 underline-offset-2 hover:underline"
            onClick={() => {
              replaceFirst(original);
              setOriginal(null);
              setMessage(null);
            }}
          >
            {copy.undo}
          </button>
        ) : null}
      </div>

      {mode === "tap" || (mode === "working" && !proposal) ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">{mode === "tap" ? copy.removeHelp : copy.removing}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={current.url}
            alt=""
            className={`max-h-80 w-full rounded-2xl object-contain ${mode === "tap" ? "cursor-crosshair" : "opacity-60"}`}
            onClick={async (event) => {
              if (mode !== "tap") return;
              const box = event.currentTarget.getBoundingClientRect();
              // object-contain: work out where the photo really sits inside the box.
              const image = event.currentTarget;
              const ratio = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
              const width = image.naturalWidth * ratio;
              const height = image.naturalHeight * ratio;
              const x = (event.clientX - box.left - (box.width - width) / 2) / width;
              const y = (event.clientY - box.top - (box.height - height) / 2) / height;
              if (x < 0 || x > 1 || y < 0 || y > 1) return;
              setMode("working");
              try {
                const { removeBackground } = await import("@/features/listings/photo-editing");
                const file = await removeBackground(current.file, x, y);
                setProposal({ file, url: URL.createObjectURL(file) });
                setMode("preview");
              } catch {
                setMessage({ text: copy.failed, ok: false });
                setMode("idle");
              }
            }}
          />
          {mode === "tap" ? (
            <button type="button" className="text-sm font-semibold text-slate-600 hover:underline" onClick={() => setMode("idle")}>
              {copy.cancel}
            </button>
          ) : null}
        </div>
      ) : null}

      {mode === "preview" && proposal ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proposal.url} alt="" className="max-h-80 w-full rounded-2xl border border-slate-200 object-contain" />
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              onClick={() => {
                replaceFirst(proposal.file);
                setProposal(null);
                setMode("idle");
                setMessage({ text: copy.removed, ok: true });
              }}
            >
              {copy.useThis}
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => {
                setProposal(null);
                setMode("idle");
              }}
            >
              {copy.cancel}
            </button>
          </div>
        </div>
      ) : null}

      <p className={`text-xs ${message ? (message.ok ? "text-emerald-700" : "text-rose-700") : "text-slate-500"}`} aria-live="polite">
        {message?.text ?? copy.onDevice}
      </p>
    </div>
  );
}
