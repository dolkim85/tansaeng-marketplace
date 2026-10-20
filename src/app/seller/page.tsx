import Link from "next/link";
import { getSession } from "@/server/session";
import {
  getSellerWithLatestApplication,
  listSellerProducts,
  getSellerDashboardSummary,
} from "@/server/seller/queries";
import { formatKRW } from "@/lib/currency";

export default async function SellerDashboardPage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;
  const [products, summary] = result
    ? await Promise.all([
        listSellerProducts(result.seller.id),
        getSellerDashboardSummary(result.seller.id),
      ])
    : [[], null];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/seller</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        생산자 대시보드
      </h1>

      {!result || !summary ? (
        <p className="mt-4 text-sm text-brand-deepgreen/60">
          <Link href="/seller/onboarding" className="text-brand-green underline">
            입점 심사를 먼저 신청하세요 →
          </Link>
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DashboardCard href="/seller/onboarding" label="심사 상태">
              {result.latestApplication?.status ?? "-"}
            </DashboardCard>
            <DashboardCard href="/seller/products" label="등록 상품 수">
              {products.length}
            </DashboardCard>
            <DashboardCard href="/seller/products" label="판매중 상품">
              {products.filter((p) => p.status === "ON_SALE").length}
            </DashboardCard>
          </div>

          <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
            조치가 필요한 항목
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DashboardCard
              href="/seller/orders"
              label="접수 대기 주문"
              warn={summary.pendingSuborders > 0}
            >
              {summary.pendingSuborders}
            </DashboardCard>
            <DashboardCard
              href="/seller/settlements"
              label="정산대기금액"
            >
              {formatKRW(summary.pendingSettlementGrossKrw)}
            </DashboardCard>
            <DashboardCard
              href="/seller/support"
              label="미해결 문의"
              warn={summary.openTickets > 0}
            >
              {summary.openTickets}
            </DashboardCard>
            <DashboardCard href="/seller/ads" label="광고 심사 대기">
              {summary.pendingAds}
            </DashboardCard>
            <DashboardCard href="/seller/group-buys" label="진행중인 공동구매">
              {summary.openGroupBuys}
            </DashboardCard>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardCard({
  href,
  label,
  warn,
  children,
}: {
  href: string;
  label: string;
  warn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-brand-green/15 bg-white p-4 hover:bg-brand-green/5"
    >
      <p className="text-xs text-brand-deepgreen/60">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold ${
          warn ? "text-brand-orange" : "text-brand-deepgreen"
        }`}
      >
        {children}
      </p>
    </Link>
  );
}
