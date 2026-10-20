import "server-only";
import { prisma } from "@/lib/db";

export async function listSellerApplications() {
  return prisma.sellerApplication.findMany({
    include: { seller: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllProductsForAdmin() {
  return prisma.product.findMany({
    include: { seller: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

/** 대리등록 폼의 농가(판매자) 선택 목록 — 입점 승인 여부와 무관하게 전부 노출. */
export async function listSellersForProxySelect() {
  return prisma.seller.findMany({
    include: {
      user: true,
      applications: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

/// "배송 지연" 임계값. 결제완료 후 이 기간이 지나도 PENDING/PREPARING/SHIPPED 중 하나에
/// 머물러 있는 Suborder를 지연으로 간주한다(마스터 문서 4.6절 "배송 지연" 지표). 실제
/// 판매자별/상품별 SLA 약속 필드가 없어 전역 고정값으로 단순화했다(PRODUCT_DECISIONS.md 참고).
const SHIPPING_DELAY_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

/** 관리자 대시보드(/admin, 마스터 문서 4.6절) 운영 지표 요약. */
export async function getAdminDashboardSummary() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const delayCutoff = new Date(now.getTime() - SHIPPING_DELAY_THRESHOLD_MS);

  const [
    pendingApplications,
    totalProducts,
    totalUsers,
    todayOrders,
    delayedSuborders,
    openDisputes,
    groupBuysAwaitingFinalization,
    pendingAds,
    pendingSettlements,
  ] = await Promise.all([
    prisma.sellerApplication.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    }),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.suborder.count({
      where: {
        status: { in: ["PENDING", "PREPARING", "SHIPPED"] },
        createdAt: { lt: delayCutoff },
      },
    }),
    prisma.supportTicket.count({
      where: { category: "DISPUTE", status: { not: "CLOSED" } },
    }),
    prisma.groupBuy.count({
      where: { status: "SCHEDULED", closeAt: { lt: now } },
    }),
    prisma.ad.count({ where: { status: "REQUESTED" } }),
    prisma.settlement.count({ where: { status: "PENDING" } }),
  ]);

  return {
    pendingApplications,
    totalProducts,
    totalUsers,
    todayOrders,
    delayedSuborders,
    openDisputes,
    groupBuysAwaitingFinalization,
    pendingAds,
    pendingSettlements,
  };
}
