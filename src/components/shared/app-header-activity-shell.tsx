"use client";

import dynamic from "next/dynamic";

const AppHeaderActivity = dynamic(
  () =>
    import("@/components/shared/app-header-activity").then(
      (module) => module.AppHeaderActivity
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/70 p-1 shadow-sm">
        <span className="h-10 w-10 rounded-full bg-white shadow-sm" />
        <span className="h-10 w-10 rounded-full bg-white shadow-sm" />
        <span className="h-10 w-10 rounded-full bg-white shadow-sm" />
      </div>
    )
  }
);

export function AppHeaderActivityShell() {
  return <AppHeaderActivity />;
}
