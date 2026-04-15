import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
