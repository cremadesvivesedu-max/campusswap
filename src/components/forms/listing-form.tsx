"use client";

import { useActionState } from "react";
import { createListingAction, updateListingAction } from "@/server/actions/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ListingImage } from "@/components/marketplace/listing-image";
import type { Category, Listing } from "@/types/domain";

interface ListingFormProps {
  categories: Category[];
  initialListing?: Listing;
}

export function ListingForm({ categories, initialListing }: ListingFormProps) {
  const formActionHandler = initialListing ? updateListingAction : createListingAction;
  const [state, action] = useActionState(formActionHandler, {
    success: false,
    message: ""
  });
  const isEditing = Boolean(initialListing);

  return (
    <form
      action={action}
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow"
    >
      {initialListing ? <input type="hidden" name="listingId" value={initialListing.id} /> : null}
      <Input
        name="title"
        placeholder="Title"
        defaultValue={initialListing?.title}
      />
      <Textarea
        name="description"
        placeholder="Describe condition, pickup timing, and what is included"
        defaultValue={initialListing?.description}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="price"
          type="number"
          placeholder="Price"
          defaultValue={initialListing?.price}
        />
        <Input
          name="pickupArea"
          placeholder="Pickup area"
          defaultValue={initialListing?.pickupArea}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <select
          name="category"
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900"
          defaultValue={initialListing?.categorySlug}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="condition"
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900"
          defaultValue={initialListing?.condition ?? "good"}
        >
          <option value="like-new">Like new</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="needs-love">Needs love</option>
        </select>
      </div>
      {initialListing?.images.length ? (
        <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Current photos
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {initialListing.images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-slate-200 bg-white"
              >
                <ListingImage
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full"
                  sizes="(max-width: 640px) 100vw, 180px"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <label className="block rounded-2xl border border-border bg-slate-50 p-4 text-sm">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {isEditing ? "Add more photos" : "Listing photos"}
        </span>
        <input name="images" type="file" accept="image/*" multiple />
      </label>
      {isEditing && initialListing?.images.length ? (
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-700">
          <input className="mr-2" name="replaceImages" type="checkbox" />{" "}
          Replace current gallery with these uploads
        </label>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input
            className="mr-2"
            name="negotiable"
            type="checkbox"
            defaultChecked={initialListing?.negotiable ?? true}
          />{" "}
          Negotiable
        </label>
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input
            className="mr-2"
            name="outlet"
            type="checkbox"
            defaultChecked={initialListing?.outlet ?? false}
          />{" "}
          Outlet
        </label>
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input
            className="mr-2"
            name="urgent"
            type="checkbox"
            defaultChecked={initialListing?.urgent ?? false}
          />{" "}
          Urgent
        </label>
      </div>
      <Button className="w-full" type="submit">
        {isEditing ? "Save changes" : "Publish listing"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.success ? "text-slate-600" : "text-rose-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
