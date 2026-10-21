import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/server/session";
import { getOrderDetail } from "@/server/orders/queries";
import { cancelOrderAction, confirmMockPaymentAction } from "@/server/orders/actions";
import { formatKRW } from "@/lib/currency";

const ORDER_STATUS_LABEL: Record<string, string> = {
  CREATED: "결제 대기",
  PAID: "결제 완료",
  CANCELLED: "취소됨",
};

const SUBORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "접수 대기",
  PREPARING: "상품 준비중",
  SHIPPED: "배송중",
  COMPLETED: "배송 완료",
  CANCELLED: "취소됨",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const order = await getOrderDetail(id);
  if (!order || !session || order.buyerId !== session.sub) notFound();

  const canConfirmPayment =
    order.status === "CREATED" && order.payment?.status === "PENDING";
  const canCancel = order.status !== "CANCELLED";
  const hasCompletedSuborder = order.suborders.some(
    (sub) => sub.status === "COMPLETED"
  );

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/orders/{id}</p>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-deepgreen">
          주문 #{order.id.slice(-8)}
        </h1>
        <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        받는 분 {order.recipientName} ({order.recipientPhone}) · {order.addressLine}
      </p>

      {order.suborders.map((sub) => (
        <div
          key={sub.id}
          className="mt-4 rounded-lg border border-brand-green/15 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-brand-deepgreen">
              {sub.seller.storeName}
            </p>
            <span className="text-xs text-brand-deepgreen/70">
              {SUBORDER_STATUS_LABEL[sub.status]}
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {sub.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.titleSnapshot} × {item.quantity}
                </span>
                <span>
                  {formatKRW(item.priceKrwSnapshot * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right text-sm font-semibold text-brand-deepgreen">
            소계 {formatKRW(sub.subtotalKrw)}
          </p>
        </div>
      ))}

      <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-green/10 p-4">
        <span className="text-sm font-medium text-brand-deepgreen">
          결제 상태: {order.payment?.status ?? "-"}
        </span>
        <span className="text-lg font-bold text-brand-green">
          {formatKRW(order.totalKrw)}
        </span>
      </div>

      {canConfirmPayment && (
        <p className="mt-2 text-xs text-brand-deepgreen/70">
          결제 대기 상태로 30분이 지나면 재고 확보를 위해 주문이 자동 취소됩니다.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {canConfirmPayment && (
          <form action={confirmMockPaymentAction.bind(null, order.id)}>
            <button
              type="submit"
              className="rounded-md bg-brand-green px-4 py-2 text-sm font-semibold text-white"
            >
              Mock 결제 확인
            </button>
          </form>
        )}
        {canCancel && (
          <form action={cancelOrderAction.bind(null, order.id)}>
            <button
              type="submit"
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600"
            >
              주문 취소
            </button>
          </form>
        )}
        {hasCompletedSuborder && (
          <Link
            href="/reviews"
            className="rounded-md border border-brand-green/30 px-4 py-2 text-sm font-semibold text-brand-deepgreen hover:bg-brand-green/10"
          >
            후기 작성하기
          </Link>
        )}
        <Link
          href={`/help?new=order&orderId=${order.id}`}
          className="rounded-md border border-brand-green/30 px-4 py-2 text-sm font-semibold text-brand-deepgreen hover:bg-brand-green/10"
        >
          문의/분쟁 접수
        </Link>
      </div>
    </section>
  );
}
