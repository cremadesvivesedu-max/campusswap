import { WantedRequestCard, WantedRequestForm } from "@/components/marketplace/wanted-board";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getAllCategories, getCurrentUser } from "@/server/queries/marketplace";
import { getOpenWantedRequests } from "@/server/queries/wanted";

// "I'm looking for…" board: ask for what you need; sellers answer by listing it.
export default async function WantedPage() {
  const [user, dictionary, categories, requests] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest(),
    getAllCategories(),
    getOpenWantedRequests()
  ]);
  const copy = dictionary.wanted;
  const categoryNames = new Map(categories.map((category) => [category.slug, category.name]));
  const mine = requests.filter((request) => request.userId === user.id);
  const others = requests.filter((request) => request.userId !== user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-950">{copy.title}</h1>
        <p className="text-sm text-slate-600">{copy.subtitle}</p>
      </div>

      <WantedRequestForm categories={categories} />

      {mine.length ? (
        <ul className="space-y-2">
          {mine.map((request) => (
            <WantedRequestCard
              key={request.id}
              request={request}
              categoryName={request.categorySlug ? categoryNames.get(request.categorySlug) : undefined}
              isOwn
            />
          ))}
        </ul>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-950">{copy.boardTitle}</h2>
        {others.length ? (
          <ul className="space-y-2">
            {others.map((request) => (
              <WantedRequestCard
                key={request.id}
                request={request}
                categoryName={request.categorySlug ? categoryNames.get(request.categorySlug) : undefined}
                isOwn={false}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">{copy.empty}</p>
        )}
      </section>
    </div>
  );
}
