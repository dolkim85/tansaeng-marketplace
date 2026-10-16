import Link from "next/link";
import { getSession } from "@/server/session";
import { prisma } from "@/lib/db";
import { listSellerTickets } from "@/server/support/queries";
import { TICKET_CATEGORY_LABEL, TICKET_STATUS_LABEL } from "@/lib/supportLabels";

export default async function SellerSupportPage() {
  const session = await getSession();
  const seller = session
    ? await prisma.seller.findUnique({ where: { userId: session.sub } })
    : null;
  const tickets = seller ? await listSellerTickets(seller.id) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">/seller/support</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        문의/반품/분쟁 대응
      </h1>

      {!seller ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          판매자 정보가 없습니다.
        </p>
      ) : tickets.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          접수된 문의가 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link
                href={`/seller/support/${t.id}`}
                className="block rounded-lg border border-brand-green/15 bg-white p-4 text-sm hover:border-brand-green/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-brand-deepgreen">
                    {t.subject}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      t.category === "DISPUTE"
                        ? "bg-red-100 text-red-600"
                        : "bg-brand-green/10 text-brand-green"
                    }`}
                  >
                    {TICKET_STATUS_LABEL[t.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-brand-deepgreen/60">
                  {TICKET_CATEGORY_LABEL[t.category]} · {t.user.name}
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
