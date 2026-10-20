"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { logAdminAction } from "@/server/audit/log";
import { calcSettlement } from "@/lib/settlement";
import { getCommissionRate } from "@/server/platformSettings/queries";

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
  const session = await requireAdmin();

  const [seller, commissionRateNow] = await Promise.all([
    prisma.seller.findUnique({ where: { id: sellerId } }),
    getCommissionRate(),
  ]);
  if (!seller) return;

  const settlement = await prisma.$transaction(async (tx) => {
    const unsettled = await tx.suborder.findMany({
      where: { sellerId, status: "COMPLETED", settlementId: null },
      select: { id: true, subtotalKrw: true },
    });
    if (unsettled.length === 0) return null;

    const grossKrw = unsettled.reduce((sum, s) => sum + s.subtotalKrw, 0);
    const { commissionRate, commissionKrw, payoutKrw } = calcSettlement(
      grossKrw,
      commissionRateNow
    );

    const created = await tx.settlement.create({
      data: { sellerId, grossKrw, commissionRate, commissionKrw, payoutKrw },
    });

    // 두 번의 "정산 실행" 클릭이 동시에 들어오면 둘 다 위에서 같은 미정산 목록을 읽을 수
    // 있다. settlementId=null 조건을 건 updateMany로 실제로 "아직 아무도 가져가지 않은"
    // 건만 원자적으로 선점하고, 하나라도 다른 트랜잭션이 먼저 가져갔다면(count 불일치)
    // 전체를 롤백해 잘못된 금액의 배치가 남지 않게 한다.
    const claim = await tx.suborder.updateMany({
      where: { id: { in: unsettled.map((s) => s.id) }, settlementId: null },
      data: { settlementId: created.id },
    });
    if (claim.count !== unsettled.length) {
      throw new Error("CONCURRENT_SETTLEMENT_CONFLICT");
    }

    return created;
  }).catch((e) => {
    if (e instanceof Error && e.message === "CONCURRENT_SETTLEMENT_CONFLICT") return null;
    throw e;
  });

  if (!settlement) return;

  await logAdminAction({
    actorId: session.sub,
    action: "SETTLEMENT_RUN",
    targetType: "Settlement",
    targetId: settlement.id,
    detail: `${seller.storeName} - GMV ${settlement.grossKrw}원 / 정산액 ${settlement.payoutKrw}원`,
  });

  revalidatePath("/admin/settlements");
  revalidatePath("/seller/settlements");
}

export async function approveSettlementAction(settlementId: string): Promise<void> {
  const session = await requireAdmin();

  const result = await prisma.settlement.updateMany({
    where: { id: settlementId, status: "PENDING" },
    data: { status: "APPROVED", approvedBy: session.sub, approvedAt: new Date() },
  });
  if (result.count === 0) return;

  await logAdminAction({
    actorId: session.sub,
    action: "SETTLEMENT_APPROVED",
    targetType: "Settlement",
    targetId: settlementId,
  });

  revalidatePath("/admin/settlements");
  revalidatePath("/seller/settlements");
}
