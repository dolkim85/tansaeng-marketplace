import "server-only";
import { prisma } from "@/lib/db";

export async function getSellerWithLatestApplication(userId: string) {
  const seller = await prisma.seller.findUnique({
    where: { userId },
    include: {
      applications: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!seller) return null;
  return {
    seller,
    latestApplication: seller.applications[0] ?? null,
  };
}

export async function listSellerProducts(sellerId: string) {
  return prisma.product.findMany({
    where: { sellerId },
    include: {
      category: true,
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllCategoriesFlat() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getSellerProductWithMedia(
  productId: string,
  userId: string
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: true,
      category: true,
      media: { orderBy: { sortOrder: "asc" } },
      contentBlocks: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product || product.seller.userId !== userId) return null;
  return product;
}

export async function listSellerProductsWithoutGroupBuy(sellerId: string) {
  return prisma.product.findMany({
    where: { sellerId, groupBuy: null },
    orderBy: { createdAt: "desc" },
  });
}

/** 판매자 대시보드(/seller) 운영 지표 요약. */
export async function getSellerDashboardSummary(sellerId: string) {
  const now = new Date();

  const [
    pendingSuborders,
    pendingSettlementGross,
    pendingAds,
    openGroupBuys,
    openTickets,
  ] = await Promise.all([
    prisma.suborder.count({ where: { sellerId, status: "PENDING" } }),
    prisma.suborder.aggregate({
      where: { sellerId, status: "COMPLETED", settlementId: null },
      _sum: { subtotalKrw: true },
    }),
    prisma.ad.count({ where: { sellerId, status: "REQUESTED" } }),
    prisma.groupBuy.count({
      where: { product: { sellerId }, status: "SCHEDULED", openAt: { lte: now }, closeAt: { gte: now } },
    }),
    prisma.supportTicket.count({ where: { sellerId, status: { not: "CLOSED" } } }),
  ]);

  return {
    pendingSuborders,
    pendingSettlementGrossKrw: pendingSettlementGross._sum.subtotalKrw ?? 0,
    pendingAds,
    openGroupBuys,
    openTickets,
  };
}
