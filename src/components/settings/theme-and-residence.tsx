"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { RESIDENCES } from "@/features/impact/seller-tools";
import { saveResidenceAction } from "@/server/actions/seller-tools";

type Theme = "system" | "light" | "dark";
const KEY = "cs-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    // Private mode: the choice lasts until the tab closes.
  }
}

/** Light / dark / like the device. Stored on this device only (no account data). */
export function ThemeSwitcher() {
  const { dictionary } = useLocale();
  const copy = dictionary.innov.theme;
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      // ignore
    }
  }, []);

  const options: { value: Theme; label: string }[] = [
    { value: "system", label: copy.system },
    { value: "light", label: copy.light },
    { value: "dark", label: copy.dark }
  ];

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-950">{copy.title}</legend>
      <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1" role="radiogroup">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={theme === option.value}
            onClick={() => {
              setTheme(option.value);
              applyTheme(option.value);
            }}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              theme === option.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Optional residence: feeds the CO2 ranking and ambassadors per residence. */
export function ResidenceSelect({ initial }: { initial: string | null }) {
  const { dictionary } = useLocale();
  const copy = dictionary.innov.residence;
  const [value, setValue] = useState(initial ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-1.5">
      <label htmlFor="residence" className="text-sm font-semibold text-slate-950">
        {copy.label}
      </label>
      <select
        id="residence"
        value={value}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          setSaved(false);
          startTransition(async () => {
            const result = await saveResidenceAction(next || null);
            setSaved(result.success);
          });
        }}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-950"
      >
        <option value="">{copy.none}</option>
        {RESIDENCES.filter((residence) => residence.slug !== "other").map((residence) => (
          <option key={residence.slug} value={residence.slug}>
            {residence.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500" aria-live="polite">
        {saved ? copy.saved : copy.help}
      </p>
    </div>
  );
}
