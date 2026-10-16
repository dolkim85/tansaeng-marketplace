"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { calcSettlement } from "@/lib/settlement";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

/// 해당 판매자의 미정산(COMPLETED, settlementId=null) Suborder를 모아 정산 배치를 생성한다.
/// 생성 즉시 그 Suborder들을 이 배치에 연결해 이후 배치에서 중복 집계되지 않게 한다.
export async function runSettlementAction(sellerId: string): Promise<void> {
  await requireAdmin();

  const unsettled = await prisma.suborder.findMany({
    where: { sellerId, status: "COMPLETED", settlementId: null },
    select: { id: true, subtotalKrw: true },
  });
  if (unsettled.length === 0) return;

  const grossKrw = unsettled.reduce((sum, s) => sum + s.subtotalKrw, 0);
  const { commissionRate, commissionKrw, payoutKrw } = calcSettlement(grossKrw);

  await prisma.$transaction(async (tx) => {
    const settlement = await tx.settlement.create({
      data: { sellerId, grossKrw, commissionRate, commissionKrw, payoutKrw },
    });
    await tx.suborder.updateMany({
      where: { id: { in: unsettled.map((s) => s.id) } },
      data: { settlementId: settlement.id },
    });
  });

  revalidatePath("/admin/settlements");
  revalidatePath("/seller/settlements");
}

export async function approveSettlementAction(settlementId: string): Promise<void> {
  const session = await requireAdmin();

  await prisma.settlement.updateMany({
    where: { id: settlementId, status: "PENDING" },
    data: { status: "APPROVED", approvedBy: session.sub, approvedAt: new Date() },
  });

  revalidatePath("/admin/settlements");
  revalidatePath("/seller/settlements");
}
