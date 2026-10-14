import { ArrivalKitChecklist } from "@/components/marketplace/arrival-kit-checklist";
import { arrivalKit, arrivalKitSearchHref, countMatches } from "@/features/listings/arrival-kit";
import { getDictionaryForRequest, getRequestLocale } from "@/lib/i18n";
import { searchMarketplaceListings } from "@/server/queries/marketplace";

// Arrival kit: the first-week shopping list for new students, with live availability.
export default async function ArrivalKitPage() {
  const [dictionary, locale, listings] = await Promise.all([
    getDictionaryForRequest(),
    getRequestLocale(),
    searchMarketplaceListings({ sort: "newest", limit: 300 })
  ]);
  const copy = dictionary.arrivalKit;
  const sections = arrivalKit.map((group) => ({
    id: group.id,
    title: group.title[locale],
    rows: group.items.map((item) => ({
      id: item.id,
      label: item.label[locale],
      href: arrivalKitSearchHref(item),
      count: countMatches(item, listings)
    }))
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{copy.eyebrow}</p>
        <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">{copy.title}</h1>
        <p className="text-sm leading-6 text-slate-600">{copy.description}</p>
      </header>
      <ArrivalKitChecklist sections={sections} copy={copy} />
    </div>
  );
}
