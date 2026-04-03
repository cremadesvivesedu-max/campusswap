import { updateAdminListingAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAdminListings } from "@/server/queries/admin";

export default async function AdminListingsPage() {
  const listings = await getAdminListings();

  return (
    <div className="space-y-4">
      {listings.map((listing) => (
        <Card key={listing.id} className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {listing.title}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            <p>Category: {listing.categorySlug}</p>
            <form action={updateAdminListingAction} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="listingId" value={listing.id} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={listing.status}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900"
                >
                  <option value="active">Active</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="archived">Archived</option>
                  <option value="pending-review">Pending review</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={listing.featured}
                    className="mr-2"
                  />
                  Featured
                </label>
                <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    name="outlet"
                    defaultChecked={listing.outlet}
                    className="mr-2"
                  />
                  Outlet
                </label>
              </div>
              <Button type="submit">Save listing controls</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
