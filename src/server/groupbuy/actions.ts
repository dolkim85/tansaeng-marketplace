"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { computeGroupBuyPhase } from "@/lib/groupBuyPhase";
import {
  getConfirmedQty,
  getUserCommittedQty,
} from "@/server/groupbuy/queries";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export async function toggleGroupBuyAlertAction(
  groupBuyId: string
): Promise<void> {
  const session = await getSession();
  if (!session) redirect(`/auth/login?from=/group-buys/${groupBuyId}`);

  const existing = await prisma.groupBuyAlert.findUnique({
    where: { userId_groupBuyId: { userId: session.sub, groupBuyId } },
  });

  if (existing) {
    await prisma.groupBuyAlert.delete({ where: { id: existing.id } });
  } else {
    await prisma.groupBuyAlert.create({
      data: { userId: session.sub, groupBuyId },
    });
  }

  revalidatePath(`/group-buys/${groupBuyId}`);
  revalidatePath("/upcoming");
}

export type JoinGroupBuyFormState = { error?: string } | undefined;

export async function joinGroupBuyAction(
  groupBuyId: string,
  _prevState: JoinGroupBuyFormState,
  formData: FormData
): Promise<JoinGroupBuyFormState> {
  const session = await getSession();
  if (!session) redirect(`/auth/login?from=/group-buys/${groupBuyId}`);

  const quantity = Number(formData.get("quantity"));
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { error: "수량을 올바르게 입력하세요." };
  }

  const gb = await prisma.groupBuy.findUnique({
    where: { id: groupBuyId },
    include: { product: true },
  });
  if (!gb) return { error: "존재하지 않는 공동구매입니다." };

  const phase = computeGroupBuyPhase(gb);
  if (phase !== "OPEN") {
    return { error: "지금은 참여할 수 있는 기간이 아닙니다." };
  }

  if (gb.perUserLimit > 0) {
    const already = await getUserCommittedQty(groupBuyId, session.sub);
    if (already + quantity > gb.perUserLimit) {
      return {
        error: `1인당 최대 ${gb.perUserLimit}개까지 주문할 수 있습니다(현재 ${already}개).`,
      };
    }
  }

  // 동시 참여로 인한 초과판매를 막기 위해 트랜잭션 내부에서 다시 한 번 재확인한다.
  const order = await prisma.$transaction(async (tx) => {
    const committedItems = await tx.orderItem.findMany({
      where: { groupBuyId, suborder: { status: { not: "CANCELLED" } } },
      select: { quantity: true },
    });
    const committed = committedItems.reduce((s, i) => s + i.quantity, 0);
    if (committed + quantity > gb.maxQty) {
      throw new Error("SOLD_OUT");
    }

    const createdOrder = await tx.order.create({
      data: {
        buyerId: session.sub,
        totalKrw: gb.priceKrw * quantity,
        recipientName: "미입력(공동구매 간편참여)",
        recipientPhone: "미입력",
        addressLine: "주문 상세에서 추후 입력 예정(M2 샌드박스 단순화)",
      },
    });

    const subtotalKrw = gb.priceKrw * quantity;
    await tx.suborder.create({
      data: {
        orderId: createdOrder.id,
        sellerId: gb.product.sellerId,
        subtotalKrw,
        items: {
          create: {
            productId: gb.productId,
            titleSnapshot: `[공동구매] ${gb.title}`,
            priceKrwSnapshot: gb.priceKrw,
            quantity,
            groupBuyId: gb.id,
          },
        },
      },
    });

    await tx.payment.create({
      data: { orderId: createdOrder.id, amountKrw: subtotalKrw },
    });

    return createdOrder;
  }).catch((e) => {
    if (e instanceof Error && e.message === "SOLD_OUT") return null;
    throw e;
  });

  if (!order) {
    return { error: "남은 수량이 부족합니다." };
  }

  revalidatePath(`/group-buys/${groupBuyId}`);
  revalidatePath("/group-buys");
  redirect(`/orders/${order.id}`);
}

const createGroupBuySchema = z
  .object({
    productId: z.string().min(1),
    title: z.string().min(2, "공동구매 제목을 입력하세요."),
    targetQty: z.coerce.number().int().positive("목표 수량을 입력하세요."),
    maxQty: z.coerce.number().int().positive("최대 공급 수량을 입력하세요."),
    perUserLimit: z.coerce.number().int().min(0),
    priceKrw: z.coerce.number().int().positive("공동구매 확정가를 입력하세요."),
    teaserStartAt: z.string().min(1),
    openAt: z.string().min(1),
    closeAt: z.string().min(1),
    expectedShipAt: z.string().min(1),
  })
  .refine((v) => v.maxQty >= v.targetQty, {
    message: "최대 공급 수량은 목표 수량 이상이어야 합니다.",
  });

export type SellerFormState = { error?: string } | undefined;

export async function createGroupBuyAction(
  _prevState: SellerFormState,
  formData: FormData
): Promise<SellerFormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/seller/group-buys");

  const parsed = createGroupBuySchema.safeParse({
    productId: formData.get("productId"),
    title: formData.get("title"),
    targetQty: formData.get("targetQty"),
    maxQty: formData.get("maxQty"),
    perUserLimit: formData.get("perUserLimit"),
    priceKrw: formData.get("priceKrw"),
    teaserStartAt: formData.get("teaserStartAt"),
    openAt: formData.get("openAt"),
    closeAt: formData.get("closeAt"),
    expectedShipAt: formData.get("expectedShipAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const seller = await prisma.seller.findUnique({
    where: { userId: session.sub },
  });
  if (!seller) return { error: "판매자 정보가 없습니다." };

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product || product.sellerId !== seller.id) {
    return { error: "본인 상품만 공동구매로 등록할 수 있습니다." };
  }

  const teaserStartAt = new Date(parsed.data.teaserStartAt);
  const openAt = new Date(parsed.data.openAt);
  const closeAt = new Date(parsed.data.closeAt);
  const expectedShipAt = new Date(parsed.data.expectedShipAt);
  if (!(teaserStartAt <= openAt && openAt < closeAt && closeAt <= expectedShipAt)) {
    return {
      error: "일정 순서를 확인하세요(티저 시작 ≤ 오픈 < 마감 ≤ 출고예정).",
    };
  }

  try {
    await prisma.groupBuy.create({
      data: {
        productId: parsed.data.productId,
        title: parsed.data.title,
        targetQty: parsed.data.targetQty,
        maxQty: parsed.data.maxQty,
        perUserLimit: parsed.data.perUserLimit,
        priceKrw: parsed.data.priceKrw,
        teaserStartAt,
        openAt,
        closeAt,
        expectedShipAt,
      },
    });
  } catch {
    return { error: "이미 해당 상품으로 등록된 공동구매가 있습니다." };
  }

  revalidatePath("/seller/group-buys");
  redirect("/seller/group-buys");
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

/** 마감 시각이 지난 공동구매를 성사/미성사로 확정하고, 미성사 시 전액 환불 처리한다. */
export async function finalizeGroupBuyAction(groupBuyId: string): Promise<void> {
  await requireAdmin();

  const gb = await prisma.groupBuy.findUnique({ where: { id: groupBuyId } });
  if (!gb || gb.status !== "SCHEDULED") return;
  if (new Date() < gb.closeAt) return;

  const confirmedQty = await getConfirmedQty(groupBuyId);
  const succeeded = confirmedQty >= gb.targetQty;

  await prisma.groupBuy.update({
    where: { id: groupBuyId },
    data: { status: succeeded ? "SUCCEEDED" : "FAILED" },
  });

  if (!succeeded) {
    await refundAllOrdersForGroupBuy(groupBuyId);
  }

  revalidatePath("/admin/group-buys");
  revalidatePath(`/group-buys/${groupBuyId}`);
  revalidatePath("/group-buys");
}

export async function cancelGroupBuyAction(groupBuyId: string): Promise<void> {
  await requireAdmin();

  const gb = await prisma.groupBuy.findUnique({ where: { id: groupBuyId } });
  if (!gb || gb.status !== "SCHEDULED") return;

  await prisma.groupBuy.update({
    where: { id: groupBuyId },
    data: { status: "CANCELLED" },
  });
  await refundAllOrdersForGroupBuy(groupBuyId);

  revalidatePath("/admin/group-buys");
  revalidatePath(`/group-buys/${groupBuyId}`);
  revalidatePath("/group-buys");
}

async function refundAllOrdersForGroupBuy(groupBuyId: string) {
  const items = await prisma.orderItem.findMany({
    where: { groupBuyId, suborder: { status: { not: "CANCELLED" } } },
    include: {
      suborder: { include: { order: { include: { payment: true } } } },
    },
  });

  const orderIds = [...new Set(items.map((i) => i.suborder.order.id))];

  for (const orderId of orderIds) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, suborders: true },
    });
    if (!order || order.status === "CANCELLED") continue;

    await prisma.$transaction(async (tx) => {
      for (const sub of order.suborders) {
        await tx.suborder.update({
          where: { id: sub.id },
          data: { status: "CANCELLED" },
        });
      }
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
      if (order.payment) {
        await tx.payment.update({
          where: { orderId },
          data: {
            status:
              order.payment.status === "CONFIRMED" ? "REFUNDED" : "FAILED",
          },
        });
      }
    });
  }
}
