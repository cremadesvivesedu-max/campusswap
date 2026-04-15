"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { resumeTransactionCheckoutAction } from "@/server/actions/marketplace";

interface TransactionCheckoutButtonProps {
  transactionId: string;
  label: string;
  pendingLabel: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
}

export function TransactionCheckoutButton({
  transactionId,
  label,
  pendingLabel,
  variant = "primary",
  size
}: TransactionCheckoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await resumeTransactionCheckoutAction(transactionId);

            if (!result.success || !result.checkoutUrl) {
              setError(result.message);
              router.refresh();
              return;
            }

            window.location.assign(result.checkoutUrl);
          })
        }
        disabled={isPending}
      >
        {isPending ? pendingLabel : label}
      </Button>
      {error ? (
        <p className="text-sm font-medium text-rose-700">{error}</p>
      ) : null}
    </div>
  );
}
