import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isAdActive } from "@/lib/adActive";

async function findActiveAd(where: Prisma.AdWhereInput) {
  const candidates = await prisma.ad.findMany({
    where: { ...where, status: "APPROVED" },
    include: { product: { include: { seller: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const active = candidates.find((ad) => isAdActive(ad));
  if (!active) return null;

  // 노출될 때만 노출수를 1 증가시킨다(모의 집계).
  await prisma.ad.update({
    where: { id: active.id },
    data: { impressions: { increment: 1 } },
  });

  return active;
}

export async function getActiveHomeBannerAd() {
  return findActiveAd({ placement: "HOME_BANNER" });
}

export async function getActiveCategoryTopAd(categoryIds: string[]) {
  if (categoryIds.length === 0) return null;
  return findActiveAd({
    placement: "CATEGORY_TOP",
    product: { categoryId: { in: categoryIds } },
  });
}

export async function getActiveSearchAd() {
  return findActiveAd({ placement: "SEARCH" });
}

export async function listSellerAds(sellerId: string) {
  return prisma.ad.findMany({
    where: { sellerId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllAdsForAdmin() {
  return prisma.ad.findMany({
    include: { product: true, seller: true },
    orderBy: { createdAt: "desc" },
  });
}
