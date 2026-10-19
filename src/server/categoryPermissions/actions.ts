"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { logAdminAction } from "@/server/audit/log";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

/// 판매자가 특정 카테고리의 판매 허가를 요청한다(마스터 문서 10.2절 5번). REJECTED였던
/// 요청은 재요청 시 PENDING으로 되돌려 다시 심사받을 수 있게 한다.
export async function requestCategoryPermissionAction(categoryId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/seller/onboarding");

  const seller = await prisma.seller.findUnique({ where: { userId: session.sub } });
  if (!seller) return;

  await prisma.sellerCategoryPermission.upsert({
    where: { sellerId_categoryId: { sellerId: seller.id, categoryId } },
    update: { status: "PENDING", note: null, reviewedBy: null, reviewedAt: null },
    create: { sellerId: seller.id, categoryId, status: "PENDING" },
  });

  revalidatePath("/seller/onboarding");
  revalidatePath("/admin/sellers");
}

export async function approveCategoryPermissionAction(permissionId: string): Promise<void> {
  const session = await requireAdmin();

  const permission = await prisma.sellerCategoryPermission.update({
    where: { id: permissionId },
    data: { status: "APPROVED", reviewedBy: session.sub, reviewedAt: new Date() },
    include: { seller: true, category: true },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "CATEGORY_PERMISSION_APPROVED",
    targetType: "SellerCategoryPermission",
    targetId: permissionId,
    detail: `${permission.seller.storeName} - ${permission.category.name}`,
  });

  revalidatePath("/admin/sellers");
  revalidatePath("/seller/onboarding");
}

export async function rejectCategoryPermissionAction(permissionId: string): Promise<void> {
  const session = await requireAdmin();

  const permission = await prisma.sellerCategoryPermission.update({
    where: { id: permissionId },
    data: { status: "REJECTED", reviewedBy: session.sub, reviewedAt: new Date() },
    include: { seller: true, category: true },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "CATEGORY_PERMISSION_REJECTED",
    targetType: "SellerCategoryPermission",
    targetId: permissionId,
    detail: `${permission.seller.storeName} - ${permission.category.name}`,
  });

  revalidatePath("/admin/sellers");
  revalidatePath("/seller/onboarding");
}
