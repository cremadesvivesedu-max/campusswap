"use client";

import { useState } from "react";
import { Link2, Share2 } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareListingButtonsProps {
  listingId: string;
  title: string;
  className?: string;
}

/** Share a listing through its public page, which works for people without an account. */
export function ShareListingButtons({ listingId, title, className }: ShareListingButtonsProps) {
  const { dictionary } = useLocale();
  const [copied, setCopied] = useState(false);
  const copy = dictionary.sharePage;

  const shareUrl = () => `${window.location.origin}/l/${listingId}`;
  const shareMessage = () => `${copy.shareText} ${title} ${shareUrl()}`;

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title, text: `${copy.shareText} ${title}`, url: shareUrl() });
              return;
            } catch {
              // Cancelled or unsupported: fall back to WhatsApp.
            }
          }
          window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage())}`, "_blank", "noopener");
        }}
      >
        <Share2 className="mr-2 h-4 w-4" />
        {copy.shareWhatsapp}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(shareUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt(copy.copyLink, shareUrl());
          }
        }}
      >
        <Link2 className="mr-2 h-4 w-4" />
        {copied ? copy.copied : copy.copyLink}
      </Button>
    </div>
  );
}
