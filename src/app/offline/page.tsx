import { getDictionaryForRequest } from "@/lib/i18n";
import { RetryButton } from "@/components/pwa/retry-button";

// Cached by the service worker and shown when a page cannot load without a connection.
// Styles are inline on purpose: the site's CSS file is not available offline.
export default async function OfflinePage() {
  const dictionary = await getDictionaryForRequest();
  const copy = dictionary.pwa;

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "0 24px",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        color: "#0f172a"
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={72} height={72} style={{ borderRadius: 16 }} />
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{copy.offlineTitle}</h1>
      <p style={{ margin: 0, maxWidth: 360, fontSize: 15, lineHeight: 1.6, color: "#475569" }}>
        {copy.offlineBody}
      </p>
      <RetryButton label={copy.retry} />
    </main>
  );
}
