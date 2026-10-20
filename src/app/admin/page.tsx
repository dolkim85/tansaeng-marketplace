import Link from "next/link";
import { getAdminDashboardSummary } from "@/server/admin/queries";

export default async function AdminDashboardPage() {
  const s = await getAdminDashboardSummary();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">/admin</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        운영 대시보드
      </h1>

      <h2 className="mt-6 text-base font-semibold text-brand-deepgreen">
        조치가 필요한 항목
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashboardCard
          href="/admin/sellers"
          label="판매자 심사 대기"
          value={s.pendingApplications}
        />
        <DashboardCard href="/admin/orders" label="오늘 주문" value={s.todayOrders} />
        <DashboardCard
          href="/admin/orders"
          label="배송 지연(3일+)"
          value={s.delayedSuborders}
          warn={s.delayedSuborders > 0}
        />
        <DashboardCard
          href="/admin/support"
          label="반품·분쟁(미해결)"
          value={s.openDisputes}
          warn={s.openDisputes > 0}
        />
        <DashboardCard
          href="/admin/group-buys"
          label="공동구매 마감 처리 대기"
          value={s.groupBuysAwaitingFinalization}
          warn={s.groupBuysAwaitingFinalization > 0}
        />
        <DashboardCard href="/admin/ads" label="광고 심사 대기" value={s.pendingAds} />
        <DashboardCard
          href="/admin/settlements"
          label="정산 승인 대기"
          value={s.pendingSettlements}
        />
      </div>

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        전체 현황
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <DashboardCard href="/admin/products" label="전체 상품 수" value={s.totalProducts} />
        <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-4">
          <p className="text-xs text-brand-deepgreen/60">전체 회원 수</p>
          <p className="mt-1 text-2xl font-semibold text-brand-deepgreen">
            {s.totalUsers}
          </p>
        </div>
      </div>

      <p className="mt-6 rounded-lg border border-dashed border-brand-deepgreen/20 bg-white/60 p-3 text-xs text-brand-deepgreen/50">
        신규 상품 등록 시 검수 대기 단계(IN_REVIEW)는 아직 구현되어 있지 않습니다(상품은
        입점 승인 여부에 따라 DRAFT 또는 ON_SALE로 즉시 분기됩니다). 별도 작업 단위로
        분리되어 있습니다.
      </p>
    </div>
  );
}

function DashboardCard({
  href,
  label,
  value,
  warn,
}: {
  href: string;
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-brand-deepgreen/15 bg-white p-4 hover:bg-brand-deepgreen/5"
    >
      <p className="text-xs text-brand-deepgreen/60">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          warn ? "text-brand-orange" : "text-brand-deepgreen"
        }`}
      >
        {value}
      </p>
    </Link>
  );
}
