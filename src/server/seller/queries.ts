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
