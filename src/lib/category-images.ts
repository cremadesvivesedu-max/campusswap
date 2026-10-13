// Photos shown on category cards. Files live in public/images/categories.
const categoryImageSlugs = new Set([
  "furniture",
  "bikes",
  "textbooks-study-materials",
  "electronics",
  "kitchen-equipment",
  "household-items",
  "essentials-daily-living",
  "outlet"
]);

export function getCategoryImage(slug: string): string | null {
  return categoryImageSlugs.has(slug) ? `/images/categories/${slug}.jpg` : null;
}
