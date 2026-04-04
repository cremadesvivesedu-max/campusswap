import { CategoryLinkCard } from "@/components/marketplace/category-link-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getAllCategories } from "@/server/queries/marketplace";

export default async function CategoriesPage() {
  const [categories, dictionary] = await Promise.all([
    getAllCategories(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow={dictionary.marketing.categories.eyebrow}
        title={dictionary.marketing.categories.title}
        description={dictionary.marketing.categories.description}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryLinkCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
