"use client";

import { memo, type ReactNode } from "react";
import { Bell, Heart, MessageSquare } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

export function AppHeaderActivity() {
  const { dictionary } = useLocale();

  const navigateTo = (href: string) => {
    if (typeof window !== "undefined") {
      window.location.assign(href);
    }
  };

  return (
    <div className="relative z-30 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/70 p-1 shadow-sm">
      <HeaderIconButton
        icon={<Heart className="h-4 w-4" />}
        label={dictionary.nav.app.saved}
        onClick={() => navigateTo("/app/saved")}
      />
      <HeaderIconButton
        icon={<MessageSquare className="h-4 w-4" />}
        label={dictionary.messages.inbox.recentTitle}
        onClick={() => navigateTo("/app/messages")}
      />
      <HeaderIconButton
        icon={<Bell className="h-4 w-4" />}
        label={dictionary.notifications.recentTitle}
        onClick={() => navigateTo("/app/notifications")}
      />
    </div>
  );
}

const HeaderIconButton = memo(function HeaderIconButton({
  icon,
  label,
  onClick
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-slate-700 shadow-sm transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
    >
      {icon}
    </button>
  );
});
