import { getSession } from "@/server/session";
import { getSellerWithLatestApplication } from "@/server/seller/queries";
import { listSubordersForSeller } from "@/server/orders/queries";
import { advanceSuborderStatusAction } from "@/server/orders/actions";
import { formatKRW } from "@/lib/currency";

const SUBORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "접수 대기",
  PREPARING: "상품 준비중",
  SHIPPED: "배송중",
  COMPLETED: "배송 완료",
  CANCELLED: "취소됨",
};

const NEXT_ACTION_LABEL: Record<string, string> = {
  PENDING: "상품 준비중으로 변경",
  PREPARING: "배송중으로 변경",
  SHIPPED: "배송완료 처리",
};

export default async function SellerOrdersPage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;
  const suborders = result
    ? await listSubordersForSeller(result.seller.id)
    : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/seller/orders</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        주문 접수/송장/출고
      </h1>

      {suborders.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          접수된 주문이 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {suborders.map((sub) => {
            const nextLabel = NEXT_ACTION_LABEL[sub.status];
            return (
              <li
                key={sub.id}
                className="rounded-lg border border-brand-green/15 bg-white p-4 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-brand-deepgreen">
                    주문 #{sub.order.id.slice(-8)}
                  </span>
                  <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
                    {SUBORDER_STATUS_LABEL[sub.status]}
                  </span>
                </div>
                <ul className="mt-2 space-y-0.5 text-xs text-brand-deepgreen/70">
                  {sub.items.map((item) => (
                    <li key={item.id}>
                      {item.titleSnapshot} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-brand-deepgreen/50">
                  받는 분 {sub.order.recipientName} · 소계{" "}
                  {formatKRW(sub.subtotalKrw)}
                </p>
                {nextLabel && sub.order.status === "PAID" && (
                  <form
                    action={advanceSuborderStatusAction.bind(null, sub.id)}
                    className="mt-2"
                  >
                    <button
                      type="submit"
                      className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {nextLabel}
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
