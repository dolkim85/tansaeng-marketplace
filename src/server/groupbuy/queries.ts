import "server-only";
import { prisma } from "@/lib/db";
import { computeGroupBuyPhase, type GroupBuyPhase } from "@/lib/groupBuyPhase";

/**
 * 목표 달성 집계 기준은 "실제 유효 결제 주문 수량"(문서 7.2) — Payment가 CONFIRMED인
 * OrderItem만 센다. 취소된 주문은 애초에 포함하지 않는다.
 */
export async function getConfirmedQty(groupBuyId: string): Promise<number> {
  const items = await prisma.orderItem.findMany({
    where: {
      groupBuyId,
      suborder: {
        status: { not: "CANCELLED" },
        order: { payment: { status: "CONFIRMED" } },
      },
    },
    select: { quantity: true },
  });
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/** maxQty 초과 판매 방지를 위한 "예약 수량"(취소되지 않은 모든 주문: 결제대기+결제완료). */
export async function getCommittedQty(groupBuyId: string): Promise<number> {
  const items = await prisma.orderItem.findMany({
    where: { groupBuyId, suborder: { status: { not: "CANCELLED" } } },
    select: { quantity: true },
  });
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export async function getUserCommittedQty(
  groupBuyId: string,
  userId: string
): Promise<number> {
  const items = await prisma.orderItem.findMany({
    where: {
      groupBuyId,
      suborder: {
        status: { not: "CANCELLED" },
        order: { buyerId: userId },
      },
    },
    select: { quantity: true },
  });
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export type GroupBuyWithStats = Awaited<
  ReturnType<typeof listAllGroupBuys>
>[number];

export async function listAllGroupBuys() {
  const groupBuys = await prisma.groupBuy.findMany({
    include: { product: { include: { seller: true } } },
    orderBy: { openAt: "asc" },
  });

  const withStats = await Promise.all(
    groupBuys.map(async (gb) => ({
      ...gb,
      phase: computeGroupBuyPhase(gb) as GroupBuyPhase,
      confirmedQty: await getConfirmedQty(gb.id),
      committedQty: await getCommittedQty(gb.id),
    }))
  );

  return withStats;
}

export async function listUpcomingGroupBuys() {
  const all = await listAllGroupBuys();
  const now = new Date();
  return all.filter(
    (gb) => gb.phase === "TEASER" && gb.teaserStartAt <= now
  );
}

export async function listOpenGroupBuys() {
  const all = await listAllGroupBuys();
  return all.filter((gb) => gb.phase === "OPEN");
}

export async function getGroupBuyDetail(id: string) {
  const gb = await prisma.groupBuy.findUnique({
    where: { id },
    include: { product: { include: { seller: true } } },
  });
  if (!gb) return null;

  return {
    ...gb,
    phase: computeGroupBuyPhase(gb) as GroupBuyPhase,
    confirmedQty: await getConfirmedQty(gb.id),
    committedQty: await getCommittedQty(gb.id),
  };
}

export async function isAlerted(userId: string, groupBuyId: string) {
  const row = await prisma.groupBuyAlert.findUnique({
    where: { userId_groupBuyId: { userId, groupBuyId } },
  });
  return Boolean(row);
}

export async function listGroupBuysForSeller(sellerId: string) {
  const groupBuys = await prisma.groupBuy.findMany({
    where: { product: { sellerId } },
    include: { product: true },
    orderBy: { openAt: "desc" },
  });

  return Promise.all(
    groupBuys.map(async (gb) => ({
      ...gb,
      phase: computeGroupBuyPhase(gb) as GroupBuyPhase,
      confirmedQty: await getConfirmedQty(gb.id),
      committedQty: await getCommittedQty(gb.id),
    }))
  );
}
