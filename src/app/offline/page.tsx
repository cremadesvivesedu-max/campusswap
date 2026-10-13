import { getDictionaryForRequest } from "@/lib/i18n";
import { RetryButton } from "@/components/pwa/retry-button";

// Cached by the service worker and shown when a page cannot load without a connection.
export default async function OfflinePage() {
  const dictionary = await getDictionaryForRequest();
  const copy = dictionary.pwa;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      {/* Plain img: the service worker caches this exact file for offline use. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={72} height={72} className="rounded-2xl" />
      <h1 className="font-display text-2xl font-semibold text-slate-950">{copy.offlineTitle}</h1>
      <p className="text-sm leading-7 text-slate-600">{copy.offlineBody}</p>
      <RetryButton label={copy.retry} />
    </main>
  );
}
