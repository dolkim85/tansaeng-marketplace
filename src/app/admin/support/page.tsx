import Link from "next/link";
import { listAllTicketsForAdmin } from "@/server/support/queries";
import { TICKET_CATEGORY_LABEL, TICKET_STATUS_LABEL } from "@/lib/supportLabels";

export default async function AdminSupportPage() {
  const tickets = await listAllTicketsForAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">/admin/support</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        고객센터/분쟁/반품
      </h1>

      {tickets.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          접수된 문의가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/support/${t.id}`}
                className="block rounded-lg border border-brand-deepgreen/15 bg-white p-4 text-sm hover:border-brand-green/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-brand-deepgreen">
                    {t.subject}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      t.category === "DISPUTE" || t.category === "REPORT"
                        ? "bg-red-100 text-red-600"
                        : "bg-brand-deepgreen/10 text-brand-deepgreen"
                    }`}
                  >
                    {TICKET_STATUS_LABEL[t.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-brand-deepgreen/60">
                  {TICKET_CATEGORY_LABEL[t.category]} · {t.user.name}
                  {t.seller && ` · ${t.seller.storeName}`}
                  {t.product && ` · ${t.product.title}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
