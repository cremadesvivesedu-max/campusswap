"use client";

import { useActionState } from "react";
import { createListingAction } from "@/server/actions/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/types/domain";

interface ListingFormProps {
  categories: Category[];
}

export function ListingForm({ categories }: ListingFormProps) {
  const [state, action] = useActionState(createListingAction, {
    success: false,
    message: ""
  });

  return (
    <form
      action={action}
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow"
    >
      <Input name="title" placeholder="Title" />
      <Textarea
        name="description"
        placeholder="Describe condition, pickup timing, and what is included"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="price" type="number" placeholder="Price" />
        <Input name="pickupArea" placeholder="Pickup area" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <select
          name="category"
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900"
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
        >
          <option value="like-new">Like new</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="needs-love">Needs love</option>
        </select>
      </div>
      <label className="block rounded-2xl border border-border bg-slate-50 p-4 text-sm">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Listing photos
        </span>
        <input name="images" type="file" accept="image/*" multiple />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input className="mr-2" name="negotiable" type="checkbox" defaultChecked />{" "}
          Negotiable
        </label>
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input className="mr-2" name="outlet" type="checkbox" /> Outlet
        </label>
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input className="mr-2" name="urgent" type="checkbox" /> Urgent
        </label>
      </div>
      <Button className="w-full" type="submit">
        Publish listing
      </Button>
      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
    </form>
  );
}
