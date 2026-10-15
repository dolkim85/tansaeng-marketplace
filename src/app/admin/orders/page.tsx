import { prisma } from "@/lib/db";
import { formatKRW } from "@/lib/currency";

const STATUS_LABEL: Record<string, string> = {
  CREATED: "결제 대기",
  PAID: "결제 완료",
  CANCELLED: "취소됨",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { buyer: true, payment: true, suborders: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">
        /admin/orders
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        주문/환불/이상 거래
      </h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          주문이 없습니다.
        </p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-deepgreen/15 text-xs text-brand-deepgreen/50">
              <th className="py-2">주문번호</th>
              <th className="py-2">구매자</th>
              <th className="py-2">판매자 수</th>
              <th className="py-2">금액</th>
              <th className="py-2">결제상태</th>
              <th className="py-2">주문상태</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-brand-deepgreen/5">
                <td className="py-2">#{o.id.slice(-8)}</td>
                <td className="py-2 text-brand-deepgreen/60">
                  {o.buyer.email}
                </td>
                <td className="py-2">{o.suborders.length}</td>
                <td className="py-2">{formatKRW(o.totalKrw)}</td>
                <td className="py-2">{o.payment?.status ?? "-"}</td>
                <td className="py-2">
                  <span className="rounded-full bg-brand-deepgreen/10 px-2 py-0.5 text-xs">
                    {STATUS_LABEL[o.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
