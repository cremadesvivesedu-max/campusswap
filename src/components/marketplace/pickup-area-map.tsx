import { MapPinned, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  maastrichtPickupAreas,
  resolvePickupArea
} from "@/lib/maastricht-pickup-areas";
import type { Dictionary } from "@/lib/i18n-shared";

interface PickupAreaMapProps {
  pickupArea?: string;
  location?: string;
  neighborhood?: string;
  copy: Dictionary["map"];
}

export function PickupAreaMap({
  pickupArea,
  location,
  neighborhood,
  copy
}: PickupAreaMapProps) {
  const area = resolvePickupArea({ pickupArea, location, neighborhood });

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-glow">
      <CardHeader className="space-y-4 border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,1))] pb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <MapPinned className="h-4 w-4 text-slate-900" />
          {copy.eyebrow}
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-slate-950">
            {copy.title}
          </h2>
          <p className="text-sm leading-7 text-slate-600">{copy.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top,#f7f4ee,white_58%,#d7f6ec)] shadow-inner">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:32px_32px]" />

          <svg
            viewBox="0 0 400 300"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <path
              d="M235 10C210 55 208 92 221 120C233 147 257 171 257 197C257 234 231 257 214 290"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="24"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M66 78C131 99 170 112 205 112"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M98 214C151 196 187 186 229 187"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M140 36C164 68 175 92 177 125"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-x-4 top-4 flex items-center justify-between rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-slate-600 backdrop-blur">
            <span>{copy.approximateZone}</span>
            <span>{copy.cityLabel}</span>
          </div>

          {maastrichtPickupAreas
            .filter((candidate) => candidate.id !== "maastricht")
            .map((candidate) => (
              <div
                key={candidate.id}
                className={`absolute hidden -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm md:block ${
                  candidate.id === area.areaId
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-white/80 bg-white/80 text-slate-600 backdrop-blur"
                }`}
                style={{ left: `${candidate.markerX}%`, top: `${candidate.markerY}%` }}
              >
                {candidate.label}
              </div>
            ))}

          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${area.markerX}%`, top: `${area.markerY}%` }}
          >
            <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/30" />
            <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/40" />
            <span className="relative block h-5 w-5 rounded-full border-4 border-white bg-emerald-500 shadow-[0_0_0_6px_rgba(15,23,42,0.14)]" />
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-[24px] bg-white/92 p-4 shadow-lg backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {copy.meetupArea}
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-slate-950">
              {area.areaLabel}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {copy.listingContext}: {area.areaSourceLabel}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {copy.guidanceTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{area.meetupNote}</p>
          </div>
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <ShieldCheck className="h-4 w-4" />
              {copy.privacyTitle}
            </div>
            <p className="mt-2 text-sm leading-6 text-emerald-900/80">
              {copy.privacyBody}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
