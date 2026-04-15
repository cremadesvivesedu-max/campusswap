import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(247,244,238,1)_38%,rgba(244,239,231,1)_100%)] text-slate-950">
      <SiteHeader />
      <main className="pb-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
