import { updateContentBlockAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminContentBlocks } from "@/server/queries/admin";

export default async function AdminContentPage() {
  const blocks = await getAdminContentBlocks();

  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <Card key={block.id} className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {block.key}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            <form action={updateContentBlockAction} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="blockId" value={block.id} />
              <Input name="title" defaultValue={block.title} />
              <Textarea
                name="body"
                defaultValue={block.body}
                className="min-h-[140px] border-slate-200 bg-white"
              />
              <Input
                name="cta"
                defaultValue={block.cta ?? ""}
                placeholder="Optional CTA label"
              />
              <Button type="submit">Save content block</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
