import "server-only";
import { prisma } from "@/lib/db";

export async function listTopCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryWithProducts(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
  if (!category) return null;

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];
  const products = await prisma.product.findMany({
    where: { categoryId: { in: categoryIds }, status: "ON_SALE" },
    include: { seller: true, media: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return { category, products };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { seller: true, category: true, media: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function searchProducts(query: string) {
  if (!query.trim()) return [];
  return prisma.product.findMany({
    where: {
      status: "ON_SALE",
      title: { contains: query },
    },
    include: {
      seller: true,
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getSellerStoreBySlug(slug: string) {
  const seller = await prisma.seller.findUnique({
    where: { storeSlug: slug },
  });
  if (!seller) return null;

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id, status: "ON_SALE" },
    include: {
      seller: true,
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return { seller, products };
}

export async function isWishlisted(userId: string, productId: string) {
  const row = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return Boolean(row);
}

export async function listWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: { product: { include: { seller: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listFollowedSellers(userId: string) {
  return prisma.sellerFollow.findMany({
    where: { userId },
    include: { seller: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function isFollowingSeller(userId: string, sellerId: string) {
  const row = await prisma.sellerFollow.findUnique({
    where: { userId_sellerId: { userId, sellerId } },
  });
  return Boolean(row);
}
