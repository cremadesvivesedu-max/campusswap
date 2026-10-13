"use client";

import { useState, useTransition } from "react";
import { Download, Trash2 } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteMyAccountAction, exportMyDataAction } from "@/server/actions/account";

export function AccountDataCard() {
  const { dictionary } = useLocale();
  const copy = dictionary.settings;
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isExporting, startExport] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p>{copy.dataExportBody}</p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isExporting}
          onClick={() =>
            startExport(async () => {
              setError(null);
              const result = await exportMyDataAction();
              if (!result.ok || !result.json) {
                setError(result.ok ? null : result.message);
                return;
              }
              const url = URL.createObjectURL(new Blob([result.json], { type: "application/json" }));
              const link = document.createElement("a");
              link.href = url;
              link.download = `campusswap-my-data-${new Date().toISOString().slice(0, 10)}.json`;
              link.click();
              URL.revokeObjectURL(url);
            })
          }
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? copy.accountWorking : copy.dataExportButton}
        </Button>
      </div>

      <div className="space-y-3 rounded-[22px] border border-rose-200 bg-rose-50/60 p-4">
        <p className="text-rose-950">{copy.deleteAccountBody}</p>
        <label className="block space-y-1 text-xs font-semibold text-rose-900" htmlFor="delete-confirmation">
          {copy.deleteAccountConfirmLabel}
          <Input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
          />
        </label>
        <Button
          type="button"
          className="w-full bg-rose-600 text-white hover:bg-rose-700"
          disabled={isDeleting || confirmation.trim().toUpperCase() !== copy.deleteAccountWord}
          onClick={() =>
            startDelete(async () => {
              setError(null);
              const result = await deleteMyAccountAction(confirmation, copy.deleteAccountWord);
              if (!result.ok) {
                setError(result.message === copy.deleteAccountWord ? copy.deleteAccountConfirmLabel : result.message);
                return;
              }
              window.location.assign("/");
            })
          }
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? copy.accountWorking : copy.deleteAccountButton}
        </Button>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
