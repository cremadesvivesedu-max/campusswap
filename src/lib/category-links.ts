export function getCategoryBrowseHref(slug: string) {
  if (slug === "outlet") {
    return "/outlet";
  }

  return `/app/categories/${slug}`;
}
