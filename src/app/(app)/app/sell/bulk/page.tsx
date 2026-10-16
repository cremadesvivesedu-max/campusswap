import { BulkSellForm } from "@/components/forms/bulk-sell-form";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getAllCategories, getCurrentUser } from "@/server/queries/marketplace";

export default async function BulkSellPage() {
  const [user, dictionary, categories] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest(),
    getAllCategories()
  ]);
  const copy = dictionary.bulkSell;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-950">{copy.title}</h1>
        <p className="text-sm text-slate-600">{copy.subtitle}</p>
      </div>
      <BulkSellForm categories={categories} defaultPickupArea={user.profile.neighborhood} />
    </div>
  );
}
