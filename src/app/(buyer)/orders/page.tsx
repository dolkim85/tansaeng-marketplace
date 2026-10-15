import Link from "next/link";
import { getSession } from "@/server/session";
import { listOrdersForBuyer } from "@/server/orders/queries";
import { formatKRW } from "@/lib/currency";

const STATUS_LABEL: Record<string, string> = {
  CREATED: "결제 대기",
  PAID: "결제 완료",
  CANCELLED: "취소됨",
};

export default async function OrdersPage() {
  const session = await getSession();
  const orders = session ? await listOrdersForBuyer(session.sub) : [];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/orders</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        내 주문
      </h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          주문 내역이 없습니다.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="block rounded-lg border border-brand-green/15 bg-white p-4 hover:bg-brand-green/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-deepgreen">
                    주문 #{order.id.slice(-8)}
                  </span>
                  <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs text-brand-green">
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-brand-deepgreen/60">
                  {order.createdAt.toLocaleDateString("ko-KR")} ·{" "}
                  {order.suborders.length}개 판매자 ·{" "}
                  {formatKRW(order.totalKrw)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
