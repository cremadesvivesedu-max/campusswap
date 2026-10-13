"use client";

import { useActionState, useEffect, useState } from "react";
import { Camera } from "lucide-react";
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
import { compressFileInput } from "@/lib/image-compression";
import { friendlyError } from "@/lib/friendly-error";
import { parsePriceRange, suggestCategory } from "@/features/listings/suggest-category";
import type { Category, Listing } from "@/types/domain";

interface ListingFormProps {
  categories: Category[];
  initialListing?: Listing;
  featuredPrice?: number;
  promotionState?: "none" | "pending" | "active" | "cancelled";
  paymentConfigured?: boolean;
  defaultPickupArea?: string;
}

export function ListingForm({
  categories,
  initialListing,
  featuredPrice = 2,
  promotionState = "none",
  paymentConfigured = false,
  defaultPickupArea = ""
}: ListingFormProps) {
  const { dictionary } = useLocale();
  const formActionHandler = initialListing ? updateListingAction : createListingAction;
  const [state, action] = useActionState(formActionHandler, {
    success: false,
    message: "",
    promotionStatus: undefined,
    listingId: undefined
  });
  const isEditing = Boolean(initialListing);
  const paymentTargetListingId = initialListing?.id ?? state.listingId;
  const effectivePromotionState = state.promotionStatus ?? promotionState;
  const [pickupEnabled, setPickupEnabled] = useState(
    initialListing?.pickupAvailable ?? true
  );
  const [compressingPhotos, setCompressingPhotos] = useState(false);
  const [shippingEnabled, setShippingEnabled] = useState(
    initialListing?.shippingAvailable ?? false
  );
  const [categorySlug, setCategorySlug] = useState(initialListing?.categorySlug ?? "");
  const [categoryTouched, setCategoryTouched] = useState(isEditing);
  const [categoryWasSuggested, setCategoryWasSuggested] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const selectedCategory = categories.find((category) => category.slug === categorySlug);
  const priceRange = parsePriceRange(selectedCategory?.typicalPriceRange);

  useEffect(
    () => () => photoPreviews.forEach((url) => URL.revokeObjectURL(url)),
    [photoPreviews]
  );

  function handleTitleChange(title: string) {
    if (categoryTouched) {
      return;
    }
    const suggestion = suggestCategory(
      title,
      categories.map((category) => category.slug)
    );
    if (suggestion) {
      setCategorySlug(suggestion);
      setCategoryWasSuggested(true);
    }
  }

  return (
    <form
      action={action}
      className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-glow sm:rounded-[28px] sm:p-6"
    >
      {initialListing ? <input type="hidden" name="listingId" value={initialListing.id} /> : null}
      {!initialListing && state.listingId ? (
        <input type="hidden" name="listingId" value={state.listingId} />
      ) : null}
      {!isEditing ? (
        <p className="text-sm font-medium text-slate-600">{dictionary.listingForm.quickTitle}</p>
      ) : null}
      {initialListing?.images.length ? (
        <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {dictionary.listingForm.currentPhotos}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {initialListing.images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-slate-200 bg-white"
              >
                <ListingImage
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full"
                  sizes="(max-width: 640px) 33vw, 180px"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <label className="block cursor-pointer rounded-[24px] border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-5 text-center transition focus-within:ring-2 focus-within:ring-emerald-500 hover:bg-emerald-50">
        <Camera className="mx-auto h-8 w-8 text-emerald-700" aria-hidden="true" />
        <span className="mt-2 block text-base font-semibold text-slate-900">
          {isEditing
            ? dictionary.listingForm.addMorePhotos
            : dictionary.listingForm.photoFirstTitle}
        </span>
        <span className="mt-1 block text-sm text-slate-600">
          {dictionary.listingForm.photoFirstHelp}
        </span>
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={async (event) => {
            const input = event.currentTarget;
            setCompressingPhotos(true);
            try {
              await compressFileInput(input);
            } finally {
              setCompressingPhotos(false);
              setPhotoPreviews(
                Array.from(input.files ?? []).map((file) => URL.createObjectURL(file))
              );
            }
          }}
        />
        {photoPreviews.length ? (
          <span className="mt-4 block">
            <span className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photoPreviews.map((url, index) => (
                // Local blob previews: next/image cannot optimise these.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt=""
                  className={`aspect-square w-full rounded-2xl object-cover ${
                    index === 0 ? "ring-2 ring-emerald-500" : ""
                  }`}
                />
              ))}
            </span>
            <span className="mt-2 block text-xs font-medium text-emerald-800">
              {dictionary.listingForm.photosReady.replace("{count}", String(photoPreviews.length))}
            </span>
          </span>
        ) : null}
      </label>
      {isEditing && initialListing?.images.length ? (
        <label className="flex min-h-12 items-center rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-700">
          <input className="mr-2 h-4 w-4" name="replaceImages" type="checkbox" />{" "}
          {dictionary.listingForm.replaceGallery}
        </label>
      ) : null}
      <Input
        name="title"
        required
        maxLength={120}
        placeholder={dictionary.listingForm.titlePlaceholder}
        defaultValue={initialListing?.title}
        onChange={(event) => handleTitleChange(event.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <select
            name="category"
            required
            aria-label={dictionary.listingForm.categoryPlaceholder}
            className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900"
            value={categorySlug}
            onChange={(event) => {
              setCategorySlug(event.target.value);
              setCategoryTouched(true);
              setCategoryWasSuggested(false);
            }}
          >
            <option value="" disabled>
              {dictionary.listingForm.categoryPlaceholder}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          {categoryWasSuggested ? (
            <p className="px-1 text-xs text-emerald-800">
              {dictionary.listingForm.categorySuggested}
            </p>
          ) : null}
        </div>
        <select
          name="condition"
          className="h-12 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900"
          defaultValue={initialListing?.condition ?? "good"}
        >
          <option value="like-new">{getConditionLabel(dictionary, "like-new")}</option>
          <option value="good">{getConditionLabel(dictionary, "good")}</option>
          <option value="fair">{getConditionLabel(dictionary, "fair")}</option>
          <option value="needs-love">{getConditionLabel(dictionary, "needs-love")}</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Input
            name="price"
            type="number"
            inputMode="decimal"
            min="1"
            step="0.5"
            required
            placeholder={dictionary.listingForm.pricePlaceholder}
            defaultValue={initialListing?.price}
          />
          {priceRange ? (
            <p className="px-1 text-xs text-slate-500">
              {dictionary.listingForm.priceHint
                .replace("{min}", String(priceRange.min))
                .replace("{max}", String(priceRange.max))}
            </p>
          ) : null}
        </div>
        <Input
          name="pickupArea"
          required
          placeholder={dictionary.listingForm.pickupAreaPlaceholder}
          defaultValue={initialListing?.pickupArea ?? defaultPickupArea}
        />
      </div>
      <Textarea
        name="description"
        placeholder={dictionary.listingForm.descriptionOptionalPlaceholder}
        defaultValue={initialListing?.description}
      />
      <details
        open={isEditing}
        className="group rounded-[24px] border border-slate-200 p-4"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-slate-700 [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" className="inline-block transition group-open:rotate-90">
            ›
          </span>
          {dictionary.listingForm.moreOptions}
        </summary>
        <div className="mt-4 space-y-4">
          <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {dictionary.listingForm.fulfillmentTitle}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex min-h-12 items-center rounded-2xl border border-border bg-white p-4 text-sm text-slate-700">
                <input
                  className="mr-2 h-4 w-4"
                  name="pickupAvailable"
                  type="checkbox"
                  checked={pickupEnabled}
                  onChange={(event) => setPickupEnabled(event.target.checked)}
                />
                {dictionary.listingForm.pickupAvailable}
              </label>
              <label className="flex min-h-12 items-center rounded-2xl border border-border bg-white p-4 text-sm text-slate-700">
                <input
                  className="mr-2 h-4 w-4"
                  name="shippingAvailable"
                  type="checkbox"
                  checked={shippingEnabled}
                  onChange={(event) => setShippingEnabled(event.target.checked)}
                />
                {dictionary.listingForm.shippingAvailable}
              </label>
            </div>
            {shippingEnabled ? (
              <Input
                name="shippingCost"
                type="number"
                min="0"
                step="0.01"
                placeholder={dictionary.listingForm.shippingCostPlaceholder}
                defaultValue={initialListing?.shippingCost ?? 0}
              />
            ) : (
              <input type="hidden" name="shippingCost" value="0" />
            )}
            <p className="text-xs leading-6 text-slate-500">
              {dictionary.listingForm.fulfillmentHelp}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex min-h-12 items-center rounded-2xl border border-border bg-slate-50 p-4 text-sm">
              <input
                className="mr-2 h-4 w-4"
                name="negotiable"
                type="checkbox"
                defaultChecked={initialListing?.negotiable ?? true}
              />{" "}
              {dictionary.listingForm.negotiable}
            </label>
            <label className="flex min-h-12 items-center rounded-2xl border border-border bg-slate-50 p-4 text-sm">
              <input
                className="mr-2 h-4 w-4"
                name="outlet"
                type="checkbox"
                defaultChecked={initialListing?.outlet ?? false}
              />{" "}
              {dictionary.listingForm.outlet}
            </label>
            <label className="flex min-h-12 items-center rounded-2xl border border-border bg-slate-50 p-4 text-sm">
              <input
                className="mr-2 h-4 w-4"
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
                className="mr-2 h-4 w-4"
                name="requestFeatured"
                type="checkbox"
                defaultChecked={effectivePromotionState !== "none"}
                disabled={effectivePromotionState === "active"}
              />
              {dictionary.listingForm.featuredRequestLabel.replace(
                "EUR 2",
                `EUR ${featuredPrice}`
              )}
            </label>
            <p>{dictionary.listingForm.featuredRequestHelp}</p>
            {effectivePromotionState === "pending" ? (
              <p className="font-medium text-amber-900">
                {dictionary.listingForm.featuredPendingNote}
              </p>
            ) : null}
            {effectivePromotionState === "cancelled" ? (
              <p className="font-medium text-rose-700">
                {dictionary.listingForm.featuredCancelledNote}
              </p>
            ) : null}
            {effectivePromotionState === "active" ? (
              <p className="font-medium text-emerald-700">
                {dictionary.listingForm.featuredActiveNote}
              </p>
            ) : null}
            {(effectivePromotionState === "pending" ||
              effectivePromotionState === "cancelled") &&
            paymentTargetListingId ? (
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
        </div>
      </details>
      <Button className="w-full" type="submit" disabled={compressingPhotos}>
        {compressingPhotos
          ? dictionary.common.actions.updating
          : isEditing
          ? dictionary.listingForm.saveChanges
          : dictionary.listingForm.publishListing}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.success ? "text-slate-600" : "text-rose-700"}`}>
          {friendlyError(state.message, dictionary)}
        </p>
      ) : null}
    </form>
  );
}
