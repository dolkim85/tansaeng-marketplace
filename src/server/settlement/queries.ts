import "server-only";
import { prisma } from "@/lib/db";

/** 아직 어떤 정산 배치에도 포함되지 않은, 배송완료(COMPLETED)된 해당 판매자의 Suborder 합계. */
export async function getPendingGrossForSeller(sellerId: string) {
  const result = await prisma.suborder.aggregate({
    where: { sellerId, status: "COMPLETED", settlementId: null },
    _sum: { subtotalKrw: true },
  });
  return result._sum.subtotalKrw ?? 0;
}

export async function listSettlementsForSeller(sellerId: string) {
  return prisma.settlement.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllSettlementsForAdmin() {
  return prisma.settlement.findMany({
    include: { seller: true },
    orderBy: { createdAt: "desc" },
  });
}

/** /admin/settlements 상단 요약 — 판매자별 정산대기금액 목록(0원인 판매자는 제외). */
export async function listSellersWithPendingSettlement() {
  const sellers = await prisma.seller.findMany({
    include: {
      suborders: {
        where: { status: "COMPLETED", settlementId: null },
        select: { subtotalKrw: true },
      },
    },
  });
  return sellers
    .map((s) => ({
      sellerId: s.id,
      storeName: s.storeName,
      pendingGrossKrw: s.suborders.reduce((sum, sub) => sum + sub.subtotalKrw, 0),
    }))
    .filter((s) => s.pendingGrossKrw > 0);
}

/** 전체 운영 지표 요약(마스터 문서 11.3절 GMV/수수료/환불액 구분). */
export async function getGlobalSettlementSummary() {
  const [completedAgg, refundedAgg] = await Promise.all([
    prisma.suborder.aggregate({
      where: { status: "COMPLETED" },
      _sum: { subtotalKrw: true },
    }),
    prisma.payment.aggregate({
      where: { status: "REFUNDED" },
      _sum: { amountKrw: true },
    }),
  ]);
  const totalGrossKrw = completedAgg._sum.subtotalKrw ?? 0;
  const totalRefundKrw = refundedAgg._sum.amountKrw ?? 0;
  return { totalGrossKrw, totalRefundKrw };
}
