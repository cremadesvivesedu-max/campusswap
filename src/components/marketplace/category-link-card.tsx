"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCategoryBrowseHref } from "@/lib/category-links";
import { getCategoryImage } from "@/lib/category-images";
import type { Category } from "@/types/domain";

export function CategoryLinkCard({ category }: { category: Category }) {
  const { dictionary } = useLocale();
  const href = getCategoryBrowseHref(category.slug);
  const image = getCategoryImage(category.slug);

  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full overflow-hidden bg-white transition group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-glow">
        {image ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        ) : null}
        <CardHeader className="space-y-3">
          <div
            className="h-2 w-14 rounded-full"
            style={{ backgroundColor: category.color }}
            aria-hidden
          />
          <h2 className="font-display text-2xl font-semibold text-slate-950">
            {category.name}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-slate-600">{category.heroDescription}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {dictionary.common.typicalRange} {category.typicalPriceRange} EUR
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
            {category.slug === "outlet"
              ? dictionary.common.actions.exploreOutlet
              : dictionary.common.actions.browseCategory}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
