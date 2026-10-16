import Link from "next/link";
import { getSession } from "@/server/session";
import { prisma } from "@/lib/db";
import { listMyTickets, listOrderItemsForTicket } from "@/server/support/queries";
import { listFaqs } from "@/server/content/queries";
import { TICKET_CATEGORY_LABEL, TICKET_STATUS_LABEL } from "@/lib/supportLabels";
import { NewProductQuestionForm } from "./NewProductQuestionForm";
import { NewOrderTicketForm } from "./NewOrderTicketForm";

export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; productId?: string; orderId?: string }>;
}) {
  const { new: newType, productId, orderId } = await searchParams;
  const session = await getSession();

  const product =
    newType === "product" && productId
      ? await prisma.product.findUnique({ where: { id: productId } })
      : null;

  const orderForTicket =
    newType === "order" && orderId && session
      ? await listOrderItemsForTicket(orderId, session.sub)
      : null;
  const orderItems = orderForTicket
    ? orderForTicket.suborders.flatMap((sub) =>
        sub.items.map((item) => ({
          id: item.id,
          titleSnapshot: item.titleSnapshot,
          sellerName: sub.seller.storeName,
        }))
      )
    : [];

  const myTickets = session ? await listMyTickets(session.sub) : [];
  const faqs = await listFaqs();

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/help</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        FAQ·문의·분쟁 접수
      </h1>

      <h2 className="mt-6 text-base font-semibold text-brand-deepgreen">
        자주 묻는 질문
      </h2>
      {faqs.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">
          등록된 FAQ가 없습니다.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {faqs.map((f) => (
            <details
              key={f.id}
              className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
            >
              <summary className="cursor-pointer font-medium text-brand-deepgreen">
                {f.question}
              </summary>
              <p className="mt-2 text-xs text-brand-deepgreen/70">{f.answer}</p>
            </details>
          ))}
        </div>
      )}

      {product && (
        <NewProductQuestionForm productId={product.id} productTitle={product.title} />
      )}
      {orderForTicket && orderItems.length > 0 && (
        <NewOrderTicketForm orderId={orderForTicket.id} items={orderItems} />
      )}

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        내 문의 내역
      </h2>
      {!session ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">
          로그인 후 문의 내역을 확인할 수 있습니다.
        </p>
      ) : myTickets.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">
          등록한 문의가 없습니다. 상품 상세페이지의 &quot;판매자에게 문의하기&quot; 또는
          주문 상세페이지의 &quot;문의/분쟁 접수&quot;로 시작하세요.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {myTickets.map((t) => (
            <li key={t.id}>
              <Link
                href={`/help/${t.id}`}
                className="block rounded-lg border border-brand-green/15 bg-white p-3 text-sm hover:border-brand-green/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-brand-deepgreen">
                    {t.subject}
                  </span>
                  <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
                    {TICKET_STATUS_LABEL[t.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-brand-deepgreen/60">
                  {TICKET_CATEGORY_LABEL[t.category]}
                  {t.product && ` · ${t.product.title}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
