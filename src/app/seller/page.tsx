import Link from "next/link";
import { getSession } from "@/server/session";
import { getSellerWithLatestApplication, listSellerProducts } from "@/server/seller/queries";

export default async function SellerDashboardPage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;
  const products = result
    ? await listSellerProducts(result.seller.id)
    : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/seller</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        생산자 대시보드
      </h1>

      {!result ? (
        <p className="mt-4 text-sm text-brand-deepgreen/60">
          <Link href="/seller/onboarding" className="text-brand-green underline">
            입점 심사를 먼저 신청하세요 →
          </Link>
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-brand-green/15 bg-white p-4">
            <p className="text-xs text-brand-deepgreen/60">심사 상태</p>
            <p className="mt-1 text-lg font-semibold text-brand-deepgreen">
              {result.latestApplication?.status ?? "-"}
            </p>
          </div>
          <div className="rounded-lg border border-brand-green/15 bg-white p-4">
            <p className="text-xs text-brand-deepgreen/60">등록 상품 수</p>
            <p className="mt-1 text-lg font-semibold text-brand-deepgreen">
              {products.length}
            </p>
          </div>
          <div className="rounded-lg border border-brand-green/15 bg-white p-4">
            <p className="text-xs text-brand-deepgreen/60">판매중 상품</p>
            <p className="mt-1 text-lg font-semibold text-brand-deepgreen">
              {products.filter((p) => p.status === "ON_SALE").length}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-dashed border-brand-green/30 bg-white/60 p-4 text-xs text-brand-deepgreen/60">
        M1 단계: 주문/정산/광고는 다음 단계에서 구현 예정.
      </div>
    </div>
  );
}
