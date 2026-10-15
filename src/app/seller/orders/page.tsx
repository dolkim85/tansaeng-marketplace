import { getSession } from "@/server/session";
import { getSellerWithLatestApplication } from "@/server/seller/queries";
import { listSubordersForSeller } from "@/server/orders/queries";
import { formatKRW } from "@/lib/currency";

const SUBORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "접수 대기",
  PREPARING: "상품 준비중",
  SHIPPED: "배송중",
  COMPLETED: "배송 완료",
  CANCELLED: "취소됨",
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
          {suborders.map((sub) => (
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
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 rounded-lg border border-dashed border-brand-green/30 bg-white/60 p-3 text-xs text-brand-deepgreen/60">
        M2 단계: 조회만 가능. 송장 등록/상태 변경은 다음 단계에서 구현 예정.
      </p>
    </div>
  );
}
