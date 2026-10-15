import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [pendingApplications, totalProducts, totalUsers] = await Promise.all([
    prisma.sellerApplication.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    }),
    prisma.product.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">/admin</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        운영 대시보드
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          href="/admin/sellers"
          className="rounded-lg border border-brand-deepgreen/15 bg-white p-4 hover:bg-brand-deepgreen/5"
        >
          <p className="text-xs text-brand-deepgreen/60">판매자 심사 대기</p>
          <p className="mt-1 text-2xl font-semibold text-brand-deepgreen">
            {pendingApplications}
          </p>
        </Link>
        <Link
          href="/admin/products"
          className="rounded-lg border border-brand-deepgreen/15 bg-white p-4 hover:bg-brand-deepgreen/5"
        >
          <p className="text-xs text-brand-deepgreen/60">전체 상품 수</p>
          <p className="mt-1 text-2xl font-semibold text-brand-deepgreen">
            {totalProducts}
          </p>
        </Link>
        <div className="rounded-lg border border-brand-deepgreen/15 bg-white p-4">
          <p className="text-xs text-brand-deepgreen/60">전체 회원 수</p>
          <p className="mt-1 text-2xl font-semibold text-brand-deepgreen">
            {totalUsers}
          </p>
        </div>
      </div>

      <p className="mt-6 rounded-lg border border-dashed border-brand-deepgreen/20 bg-white/60 p-3 text-xs text-brand-deepgreen/50">
        M1 단계: 주문/분쟁/공동구매/광고 운영 지표는 다음 단계에서 구현 예정.
      </p>
    </div>
  );
}
