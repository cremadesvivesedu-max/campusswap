"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { friendlyError } from "@/lib/friendly-error";
import { closeWantedRequestAction, createWantedRequestAction } from "@/server/actions/wanted";
import type { WantedRequest } from "@/server/queries/wanted";
import type { Category } from "@/types/domain";

export function WantedRequestForm({ categories }: { categories: Category[] }) {
  const { dictionary } = useLocale();
  const copy = dictionary.wanted;
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createWantedRequestAction, { success: false, message: "" });

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-3xl bg-white p-4 sm:p-5">
      <p className="font-bold text-slate-950">{copy.formTitle}</p>
      <Input name="title" required minLength={3} maxLength={120} placeholder={copy.whatPlaceholder} />
      <div className="grid grid-cols-2 gap-3">
        <select
          name="category"
          defaultValue=""
          aria-label={copy.categoryAny}
          className="h-11 w-full rounded-2xl border border-border bg-white px-3 text-sm text-slate-900"
        >
          <option value="">{copy.categoryAny}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <Input name="maxPrice" type="number" inputMode="decimal" min="1" step="1" placeholder={copy.maxPrice} />
      </div>
      <Input name="note" maxLength={300} placeholder={copy.notePlaceholder} />
      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending ? copy.posting : copy.post}
      </Button>
      {state.message ? (
        <p role="status" className={`text-sm ${state.success ? "text-emerald-700" : "text-rose-700"}`}>
          {friendlyError(state.message, dictionary)}
        </p>
      ) : null}
    </form>
  );
}

export function WantedRequestCard({
  request,
  categoryName,
  isOwn
}: {
  request: WantedRequest;
  categoryName?: string;
  isOwn: boolean;
}) {
  const { dictionary } = useLocale();
  const copy = dictionary.wanted;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const sellHref = `/app/sell?title=${encodeURIComponent(request.title)}${request.categorySlug ? `&category=${encodeURIComponent(request.categorySlug)}` : ""}`;

  return (
    <li className={`flex gap-3 rounded-2xl border bg-white p-4 ${isOwn ? "border-emerald-200" : "border-slate-200"}`}>
      <ProfileAvatar
        userId={request.userId}
        name={request.requesterName}
        src={request.requesterAvatar}
        className="h-10 w-10 shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex items-start gap-1.5 font-bold text-slate-950">
          <Search className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{request.title}</span>
        </p>
        <p className="text-xs text-slate-500">
          {isOwn ? copy.yours : request.requesterName.split(" ")[0]}
          {categoryName ? ` · ${categoryName}` : ""}
          {request.maxPrice ? ` · ${copy.upTo.replace("{price}", String(request.maxPrice))}` : ""}
        </p>
        {request.note ? <p className="text-sm text-slate-600">{request.note}</p> : null}
      </div>
      <div className="shrink-0 self-center">
        {isOwn ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await closeWantedRequestAction(request.id);
                router.refresh();
              })
            }
          >
            {copy.close}
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href={sellHref}>{copy.haveOne}</Link>
          </Button>
        )}
      </div>
    </li>
  );
}
