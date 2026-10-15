"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

export async function approveApplicationAction(
  applicationId: string
): Promise<void> {
  const session = await requireAdmin();

  const application = await prisma.sellerApplication.update({
    where: { id: applicationId },
    data: {
      status: "APPROVED",
      reviewedBy: session.sub,
      reviewedAt: new Date(),
    },
  });

  // 승인 시 기존 임시저장(DRAFT) 상품을 판매중으로 전환한다.
  await prisma.product.updateMany({
    where: { sellerId: application.sellerId, status: "DRAFT" },
    data: { status: "ON_SALE" },
  });

  revalidatePath("/admin/sellers");
}

export async function rejectApplicationAction(
  applicationId: string
): Promise<void> {
  const session = await requireAdmin();

  await prisma.sellerApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      reviewedBy: session.sub,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/sellers");
}
