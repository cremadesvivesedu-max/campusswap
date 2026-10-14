"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";

export interface ArrivalKitRow {
  id: string;
  label: string;
  href: string;
  count: number;
}

export interface ArrivalKitSection {
  id: string;
  title: string;
  rows: ArrivalKitRow[];
}

const STORAGE_KEY = "campusswap-arrival-kit";

function readDone(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

/** Tick-off list; what you already own is remembered on this device only. */
export function ArrivalKitChecklist({
  sections,
  copy
}: {
  sections: ArrivalKitSection[];
  copy: { available: string; none: string; progress: string };
}) {
  const [done, setDone] = useState<string[]>([]);
  const total = sections.reduce((sum, section) => sum + section.rows.length, 0);

  useEffect(() => {
    setDone(readDone());
  }, []);

  const toggle = (id: string) => {
    setDone((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode: ticks just won't be remembered.
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          {copy.progress.replace("{done}", String(done.length)).replace("{total}", String(total))}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${total ? (done.length / total) * 100 : 0}%` }}
          />
        </div>
      </div>
      {sections.map((section) => (
        <section key={section.id} className="space-y-2">
          <h2 className="text-lg font-extrabold text-slate-950">{section.title}</h2>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {section.rows.map((row) => {
              const isDone = done.includes(row.id);
              return (
                <li key={row.id} className="flex items-center gap-3 px-3 py-2.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={row.label}
                    onClick={() => toggle(row.id)}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : null}
                  </button>
                  <Link href={row.href} className="flex min-w-0 flex-1 items-center gap-2">
                    <span className={`flex-1 truncate font-semibold ${isDone ? "text-slate-400 line-through" : "text-slate-900"}`}>
                      {row.label}
                    </span>
                    <span className={`shrink-0 text-xs font-semibold ${row.count ? "text-emerald-700" : "text-slate-400"}`}>
                      {row.count ? copy.available.replace("{n}", String(row.count)) : copy.none}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
