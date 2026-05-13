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
        <span className="h-9 w-9 rounded-full bg-white shadow-sm sm:h-10 sm:w-10" />
        <span className="h-9 w-9 rounded-full bg-white shadow-sm sm:h-10 sm:w-10" />
        <span className="h-9 w-9 rounded-full bg-white shadow-sm sm:h-10 sm:w-10" />
      </div>
    )
  }
);

export function AppHeaderActivityShell() {
  return <AppHeaderActivity />;
}
