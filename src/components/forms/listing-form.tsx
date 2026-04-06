"use client";

import { useActionState, useEffect, useRef } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { getConditionLabel } from "@/lib/i18n-shared";
import {
  createListingAction,
  startFeaturedPromotionCheckoutAction,
  updateListingAction
} from "@/server/actions/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ListingImage } from "@/components/marketplace/listing-image";
import type { Category, Listing } from "@/types/domain";

interface ListingFormProps {
  categories: Category[];
  initialListing?: Listing;
  featuredPrice?: number;
  promotionState?: "none" | "pending" | "active" | "cancelled";
  paymentConfigured?: boolean;
}

export function ListingForm({
  categories,
  initialListing,
  featuredPrice = 2,
  promotionState = "none",
  paymentConfigured = false
}: ListingFormProps) {
  const { dictionary } = useLocale();
  const formActionHandler = initialListing ? updateListingAction : createListingAction;
  const [state, action] = useActionState(formActionHandler, {
    success: false,
    message: "",
    redirectTo: undefined,
    promotionStatus: undefined
  });
  const isEditing = Boolean(initialListing);
  const redirectedTo = useRef<string | null>(null);

  useEffect(() => {
    if (
      state.redirectTo &&
      redirectedTo.current !== state.redirectTo &&
      typeof window !== "undefined"
    ) {
      redirectedTo.current = state.redirectTo;
      window.location.assign(state.redirectTo);
    }
  }, [state.redirectTo]);

  return (
    <form
      action={action}
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-glow"
    >
      {initialListing ? <input type="hidden" name="listingId" value={initialListing.id} /> : null}
      <Input
        name="title"
        placeholder={dictionary.listingForm.titlePlaceholder}
        defaultValue={initialListing?.title}
      />
      <Textarea
        name="description"
        placeholder={dictionary.listingForm.descriptionPlaceholder}
        defaultValue={initialListing?.description}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="price"
          type="number"
          placeholder={dictionary.listingForm.pricePlaceholder}
          defaultValue={initialListing?.price}
        />
        <Input
          name="pickupArea"
          placeholder={dictionary.listingForm.pickupAreaPlaceholder}
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
          <option value="like-new">{getConditionLabel(dictionary, "like-new")}</option>
          <option value="good">{getConditionLabel(dictionary, "good")}</option>
          <option value="fair">{getConditionLabel(dictionary, "fair")}</option>
          <option value="needs-love">{getConditionLabel(dictionary, "needs-love")}</option>
        </select>
      </div>
      {initialListing?.images.length ? (
        <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {dictionary.listingForm.currentPhotos}
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
          {isEditing
            ? dictionary.listingForm.addMorePhotos
            : dictionary.listingForm.listingPhotos}
        </span>
        <input name="images" type="file" accept="image/*" multiple />
      </label>
      {isEditing && initialListing?.images.length ? (
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-700">
          <input className="mr-2" name="replaceImages" type="checkbox" />{" "}
          {dictionary.listingForm.replaceGallery}
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
          {dictionary.listingForm.negotiable}
        </label>
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input
            className="mr-2"
            name="outlet"
            type="checkbox"
            defaultChecked={initialListing?.outlet ?? false}
          />{" "}
          {dictionary.listingForm.outlet}
        </label>
        <label className="rounded-2xl border border-border bg-slate-50 p-4 text-sm">
          <input
            className="mr-2"
            name="urgent"
            type="checkbox"
            defaultChecked={initialListing?.urgent ?? false}
          />{" "}
          {dictionary.listingForm.urgent}
        </label>
      </div>
      <div className="space-y-3 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
        <label className="block">
          <input
            className="mr-2"
            name="requestFeatured"
            type="checkbox"
            defaultChecked={promotionState !== "none"}
            disabled={promotionState === "active"}
          />
          {dictionary.listingForm.featuredRequestLabel.replace(
            "EUR 2",
            `EUR ${featuredPrice}`
          )}
        </label>
        <p>{dictionary.listingForm.featuredRequestHelp}</p>
        {promotionState === "pending" ? (
          <p className="font-medium text-amber-900">
            {dictionary.listingForm.featuredPendingNote}
          </p>
        ) : null}
        {promotionState === "cancelled" ? (
          <p className="font-medium text-rose-700">
            {dictionary.listingForm.featuredCancelledNote}
          </p>
        ) : null}
        {promotionState === "active" ? (
          <p className="font-medium text-emerald-700">
            {dictionary.listingForm.featuredActiveNote}
          </p>
        ) : null}
        {(promotionState === "pending" || promotionState === "cancelled") &&
        isEditing &&
        initialListing ? (
          paymentConfigured ? (
            <Button
              type="submit"
              formAction={startFeaturedPromotionCheckoutAction}
              variant="secondary"
              className="w-full border border-amber-300 bg-white text-slate-900 hover:bg-amber-100"
            >
              {dictionary.listingForm.featuredCheckoutButton.replace(
                "EUR 2",
                `EUR ${featuredPrice}`
              )}
            </Button>
          ) : (
            <p className="font-medium text-slate-600">
              {dictionary.listingForm.featuredPaymentUnavailable}
            </p>
          )
        ) : null}
      </div>
      <Button className="w-full" type="submit">
        {isEditing
          ? dictionary.listingForm.saveChanges
          : dictionary.listingForm.publishListing}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.success ? "text-slate-600" : "text-rose-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
