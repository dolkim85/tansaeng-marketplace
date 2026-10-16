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
