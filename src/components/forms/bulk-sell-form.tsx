"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, X, XCircle } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { suggestCategory } from "@/features/listings/suggest-category";
import { compressImages } from "@/lib/image-compression";
import { friendlyError } from "@/lib/friendly-error";
import { getConditionLabel } from "@/lib/i18n-shared";
import { createQuickListingAction } from "@/server/actions/forms";
import type { Category } from "@/types/domain";

interface Item {
  key: string;
  file: File;
  preview: string;
  title: string;
  price: string;
  categorySlug: string;
  categoryTouched: boolean;
  status: "idle" | "sending" | "done" | "error";
  error?: string;
  needsReview?: boolean;
}

const MAX_ITEMS = 20;

/** "Moving out" mode: one photo becomes one listing; publish them all in one go. */
export function BulkSellForm({ categories, defaultPickupArea }: { categories: Category[]; defaultPickupArea: string }) {
  const { dictionary } = useLocale();
  const copy = dictionary.bulkSell;
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [pickupArea, setPickupArea] = useState(defaultPickupArea);
  const [condition, setCondition] = useState("good");
  const [running, setRunning] = useState(false);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const slugs = categories.map((category) => category.slug);

  useEffect(() => () => items.forEach((item) => URL.revokeObjectURL(item.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = async (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/")).slice(0, MAX_ITEMS - items.length);
    const compressed = await compressImages(images);
    setItems((current) => [
      ...current,
      ...compressed.map((file, index) => ({
        key: `${Date.now()}-${index}-${file.name}`,
        file,
        preview: URL.createObjectURL(file),
        title: "",
        price: "",
        categorySlug: "",
        categoryTouched: false,
        status: "idle" as const
      }))
    ]);
  };

  const update = (key: string, patch: Partial<Item>) =>
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const pending = items.filter((item) => item.status !== "done");
  const complete = (item: Item) => item.title.trim().length > 1 && Number(item.price) > 0 && item.categorySlug;
  const doneCount = items.filter((item) => item.status === "done").length;
  const allDone = items.length > 0 && doneCount === items.length;

  const publishAll = async () => {
    if (pending.some((item) => !complete(item))) {
      setShowIncomplete(true);
      return;
    }
    setShowIncomplete(false);
    setRunning(true);
    for (const item of pending) {
      update(item.key, { status: "sending", error: undefined });
      const formData = new FormData();
      formData.set("title", item.title.trim());
      formData.set("price", item.price);
      formData.set("category", item.categorySlug);
      formData.set("condition", condition);
      formData.set("pickupArea", pickupArea);
      formData.set("image", item.file);
      try {
        const result = await createQuickListingAction(formData);
        update(
          item.key,
          result.success
            ? { status: "done", needsReview: result.needsReview }
            : { status: "error", error: friendlyError(result.message, dictionary) }
        );
      } catch {
        update(item.key, { status: "error", error: copy.failed });
      }
    }
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-12 text-emerald-800 transition hover:bg-emerald-50"
        >
          <ImagePlus className="h-10 w-10" aria-hidden="true" />
          <span className="text-lg font-extrabold">{copy.pick}</span>
          <span className="text-xs text-emerald-700">1–{MAX_ITEMS}</span>
        </button>
      ) : (
        <>
          <div className="grid gap-3 rounded-3xl bg-white p-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-600">{copy.pickupArea}</span>
              <Input value={pickupArea} onChange={(event) => setPickupArea(event.target.value)} disabled={running} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-600">{copy.condition}</span>
              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                disabled={running}
                className="h-11 w-full rounded-2xl border border-border bg-white px-3 text-sm text-slate-900"
              >
                {(["like-new", "good", "fair", "needs-love"] as const).map((value) => (
                  <option key={value} value={value}>
                    {getConditionLabel(dictionary, value)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ul className="space-y-3">
            {items.map((item) => {
              const locked = running || item.status === "done";
              const missing = showIncomplete && item.status !== "done" && !complete(item);
              return (
                <li
                  key={item.key}
                  className={`flex gap-3 rounded-2xl border bg-white p-3 ${missing ? "border-rose-300" : item.status === "done" ? "border-emerald-200" : "border-slate-200"}`}
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.preview} alt="" className="h-full w-full object-cover" />
                    {item.status === "sending" ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-700" aria-hidden="true" />
                      </span>
                    ) : null}
                    {item.status === "done" ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-emerald-600/70">
                        <CheckCircle2 className="h-8 w-8 text-white" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={item.title}
                        maxLength={120}
                        placeholder={copy.titlePlaceholder}
                        disabled={locked}
                        onChange={(event) => {
                          const title = event.target.value;
                          const suggested = item.categoryTouched ? null : suggestCategory(title, slugs);
                          update(item.key, { title, ...(suggested ? { categorySlug: suggested } : {}) });
                        }}
                      />
                      {item.status !== "done" ? (
                        <button
                          type="button"
                          aria-label={copy.remove}
                          disabled={running}
                          onClick={() => {
                            URL.revokeObjectURL(item.preview);
                            setItems((current) => current.filter((other) => other.key !== item.key));
                          }}
                          className="flex h-11 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-[90px_1fr] gap-2">
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        step="0.5"
                        value={item.price}
                        placeholder={copy.pricePlaceholder}
                        disabled={locked}
                        onChange={(event) => update(item.key, { price: event.target.value })}
                      />
                      <select
                        value={item.categorySlug}
                        disabled={locked}
                        aria-label={copy.categoryPlaceholder}
                        onChange={(event) => update(item.key, { categorySlug: event.target.value, categoryTouched: true })}
                        className="h-11 w-full min-w-0 rounded-2xl border border-border bg-white px-3 text-sm text-slate-900"
                      >
                        <option value="" disabled>
                          {copy.categoryPlaceholder}
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.slug}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {item.status === "error" ? (
                      <p className="flex items-center gap-1 text-xs text-rose-700">
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.error ?? copy.failed}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          {showIncomplete ? <p className="text-sm text-rose-700">{copy.incomplete}</p> : null}

          {allDone ? (
            <div className="space-y-3 rounded-3xl bg-emerald-50 p-5 text-center">
              <p className="text-lg font-extrabold text-emerald-900">
                {copy.done.replace("{count}", String(doneCount))}
              </p>
              {items.some((item) => item.needsReview) ? <p className="text-sm text-emerald-800">{copy.inReview}</p> : null}
              <Button asChild>
                <Link href="/app/my-listings">{copy.seeListings}</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" className="flex-1" disabled={running || pending.length === 0} onClick={publishAll}>
                {running
                  ? copy.publishing.replace("{done}", String(doneCount)).replace("{count}", String(items.length))
                  : copy.publish.replace("{count}", String(pending.length))}
              </Button>
              {items.length < MAX_ITEMS ? (
                <Button type="button" variant="outline" disabled={running} onClick={() => inputRef.current?.click()}>
                  <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
                  {copy.pickMore}
                </Button>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
