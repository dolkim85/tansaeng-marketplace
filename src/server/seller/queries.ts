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
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllCategoriesFlat() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function listSellerProductsWithoutGroupBuy(sellerId: string) {
  return prisma.product.findMany({
    where: { sellerId, groupBuy: null },
    orderBy: { createdAt: "desc" },
  });
}
