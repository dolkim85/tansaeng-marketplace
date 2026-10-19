import "server-only";
import { prisma } from "@/lib/db";

/** 판매자가 자신의 카테고리별 허가 현황을 보는 화면용(/seller/onboarding). */
export async function listCategoryPermissionsForSeller(sellerId: string) {
  const [categories, permissions] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.sellerCategoryPermission.findMany({ where: { sellerId } }),
  ]);
  const bySellerCategory = new Map(permissions.map((p) => [p.categoryId, p]));
  return categories.map((c) => ({
    category: c,
    permission: bySellerCategory.get(c.id) ?? null,
  }));
}

/** 상품 등록 폼에서 선택 가능한(APPROVED) 카테고리 목록. */
export async function listApprovedCategoriesForSeller(sellerId: string) {
  const permissions = await prisma.sellerCategoryPermission.findMany({
    where: { sellerId, status: "APPROVED" },
    include: { category: true },
  });
  return permissions.map((p) => p.category);
}

export async function hasApprovedCategoryPermission(
  sellerId: string,
  categoryId: string
): Promise<boolean> {
  const permission = await prisma.sellerCategoryPermission.findUnique({
    where: { sellerId_categoryId: { sellerId, categoryId } },
  });
  return permission?.status === "APPROVED";
}

/** 관리자 심사 화면용 — 전체 요청(대기 우선, 최신순). */
export async function listAllCategoryPermissionsForAdmin() {
  return prisma.sellerCategoryPermission.findMany({
    include: { seller: true, category: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}
