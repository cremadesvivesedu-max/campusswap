import { CategoryLinkCard } from "@/components/marketplace/category-link-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getAllCategories } from "@/server/queries/marketplace";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Browse by category"
        title="Organized around how students actually shop in Maastricht."
        description="From first-week essentials to fast move-out clearances, category entry points now route directly into the correct browse experience."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryLinkCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
