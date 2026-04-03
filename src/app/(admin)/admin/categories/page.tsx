import { updateCategoryAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminCategories } from "@/server/queries/admin";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {categories.map((category) => (
        <Card key={category.id} className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {category.name}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            <form action={updateCategoryAction} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="categoryId" value={category.id} />
              <Input name="name" defaultValue={category.name} />
              <Input
                name="typicalPriceRange"
                defaultValue={category.typicalPriceRange}
                placeholder="Typical price range"
              />
              <Input name="color" defaultValue={category.color} />
              <Textarea
                name="shortDescription"
                defaultValue={category.shortDescription}
                className="min-h-[90px] border-slate-200 bg-white"
              />
              <Textarea
                name="heroDescription"
                defaultValue={category.heroDescription}
                className="min-h-[120px] border-slate-200 bg-white"
              />
              <Button type="submit">Save category</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
