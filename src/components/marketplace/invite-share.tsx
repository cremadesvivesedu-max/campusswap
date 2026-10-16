"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

/** The invite link with copy, native share and WhatsApp buttons. */
export function InviteShare({ link }: { link: string }) {
  const { dictionary } = useLocale();
  const copy = dictionary.invite;
  const [copied, setCopied] = useState(false);
  const message = `${copy.shareText} ${link}`;

  return (
    <div className="space-y-3">
      <p className="truncate rounded-2xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800">{link}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              // Clipboard blocked: the link is visible above to copy by hand.
            }
          }}
        >
          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          {copied ? copy.copied : copy.copy}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (typeof navigator.share === "function") {
              void navigator.share({ title: "CampusSwap", text: copy.shareText, url: link }).catch(() => undefined);
            } else {
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
            }
          }}
        >
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          {copy.share}
        </Button>
        <Button asChild className="bg-[#25D366] text-slate-950 hover:bg-[#1ebe5b]">
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            {copy.whatsapp}
          </a>
        </Button>
      </div>
    </div>
  );
}
