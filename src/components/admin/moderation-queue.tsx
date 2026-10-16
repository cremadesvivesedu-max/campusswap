import { AlertTriangle, Check, X } from "lucide-react";
import { rejectListingAction, updateAdminListingAction } from "@/server/actions/admin";
import type { ModerationQueueItem } from "@/server/queries/admin";

const reasonLabels: Record<string, string> = {
  "external link in the description": "Enlace externo en la descripción",
  "contact details outside the chat": "Datos de contacto fuera del chat",
  "account not verified as a student yet": "Cuenta sin verificar como estudiante"
};

function reasonLabel(reason: string) {
  if (reasonLabels[reason]) return reasonLabels[reason];
  if (reason.startsWith("suspicious wording")) return reason.replace("suspicious wording", "Frases sospechosas");
  if (reason.startsWith("price looks too good to be true")) return reason.replace("price looks too good to be true", "Precio imposible");
  return reason;
}

/** Held listings with the reason, and approve / reject in one tap (works on a phone). */
export function ModerationQueue({ items }: { items: ModerationQueueItem[] }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-950">Pendientes de revisar ({items.length})</h2>
        <p className="text-sm text-slate-500">Los más antiguos primero. Al rechazar, el vendedor recibe el motivo.</p>
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">Nada pendiente. 🎉</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="space-y-3 rounded-2xl border border-amber-200 bg-white p-4">
              <div className="flex gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-bold text-slate-950">
                    €{item.price} · {item.title}
                  </p>
                  <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>
                  <p className="text-xs text-slate-500">
                    {item.sellerName} · {item.sellerVerified ? "verificado" : "sin verificar"} · {item.categoryName} ·{" "}
                    {new Date(item.createdAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              {item.reasons.length ? (
                <ul className="space-y-1">
                  {item.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-1.5 text-xs font-semibold text-amber-800">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {reasonLabel(reason)}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
                <form action={updateAdminListingAction}>
                  <input type="hidden" name="listingId" value={item.id} />
                  <input type="hidden" name="status" value="active" />
                  {item.featured ? <input type="hidden" name="featured" value="on" /> : null}
                  {item.outlet ? <input type="hidden" name="outlet" value="on" /> : null}
                  <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" /> Aprobar
                  </button>
                </form>
                <form action={rejectListingAction} className="flex gap-2">
                  <input type="hidden" name="listingId" value={item.id} />
                  <select
                    name="reason"
                    defaultValue="scam"
                    aria-label="Motivo"
                    className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="scam">Posible estafa</option>
                    <option value="prohibited">Artículo no permitido</option>
                    <option value="price">Precio o descripción engañosos</option>
                    <option value="duplicate">Duplicado</option>
                    <option value="quality">Falta foto real o descripción</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-rose-200 px-4 text-sm font-bold text-rose-700 hover:bg-rose-50"
                  >
                    <X className="h-4 w-4" aria-hidden="true" /> Rechazar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
