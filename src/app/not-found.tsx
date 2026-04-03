import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-20 text-center">
      <h1 className="font-display text-4xl font-semibold text-slate-950">That page is not here.</h1>
      <p className="text-sm leading-7 text-slate-600">The listing or route may have moved, expired, or never existed in this demo build.</p>
      <Button asChild><Link href="/">Back to home</Link></Button>
    </div>
  );
}
