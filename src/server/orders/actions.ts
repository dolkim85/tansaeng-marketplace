"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { logNotification } from "@/server/notifications/log";

export type CheckoutFormState = { error?: string } | undefined;

const checkoutSchema = z.object({
  recipientName: z.string().min(1, "받는 분 성함을 입력하세요."),
  recipientPhone: z.string().min(9, "연락처를 입력하세요."),
  addressLine: z.string().min(5, "배송지 주소를 입력하세요."),
});

/// 재고 예약 타임아웃. 결제 대기(CREATED) 상태로 이 시간을 넘긴 주문은 재고를
/// 무기한 점유하지 못하게 자동 취소한다. 이 프로젝트는 스케줄러를 쓰지 않으므로
/// (공동구매 단계 계산과 동일한 원칙), 백그라운드 잡 대신 재고가 실제로 문제될 수
/// 있는 시점(새 체크아웃 시도, 본인 주문 결제 확인 시도)마다 지연 소거(lazy sweep)한다.
const ORDER_RESERVATION_TIMEOUT_MS = 30 * 60 * 1000;

/// 타임아웃을 넘긴 CREATED 주문을 전부 취소하고 재고를 복구한다. cancelOrderAction과
/// 로직은 같으나(상태 전환을 조건부 updateMany로 한 번만 성공시켜 중복 복구 방지),
/// 특정 구매자 1건이 아니라 조건에 맞는 모든 주문을 한 번에 처리한다. 기존 결정에
/// 따라(PRODUCT_DECISIONS.md) 구매자 본인이 방치해 발생한 자동 취소는 알림 대상에서
/// 제외한다(능동적 조치가 아니라 당연한 결과라 알림 스팸에 가까움).
async function releaseExpiredOrders(): Promise<void> {
  const cutoff = new Date(Date.now() - ORDER_RESERVATION_TIMEOUT_MS);
  const expired = await prisma.order.findMany({
    where: { status: "CREATED", createdAt: { lt: cutoff } },
    include: { payment: true, suborders: { include: { items: true } } },
  });

  for (const order of expired) {
    await prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id: order.id, status: "CREATED" },
        data: { status: "CANCELLED" },
      });
      if (result.count === 0) return;

      for (const suborder of order.suborders) {
        for (const item of suborder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: { increment: item.quantity } },
          });
        }
        await tx.suborder.update({
          where: { id: suborder.id },
          data: { status: "CANCELLED" },
        });
      }

      if (order.payment) {
        await tx.payment.update({
          where: { orderId: order.id },
          data: { status: "FAILED" },
        });
      }
    });
  }
}

export async function checkoutAction(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/checkout");

  const parsed = checkoutSchema.safeParse({
    recipientName: formData.get("recipientName"),
    recipientPhone: formData.get("recipientPhone"),
    addressLine: formData.get("addressLine"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  // 새 체크아웃이 재고 부족을 가장 먼저 체감하는 지점이라, 여기서 먼저 방치된
  // 예약을 정리해 실제 가용 재고를 최대한 정확히 반영한다.
  await releaseExpiredOrders();

  const cart = await prisma.cart.findUnique({
    where: { userId: session.sub },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return { error: "장바구니가 비어 있습니다." };
  }

  for (const item of cart.items) {
    if (item.product.status !== "ON_SALE") {
      return { error: `${item.product.title} 상품은 현재 구매할 수 없습니다.` };
    }
    if (item.product.stockQty < item.quantity) {
      return { error: `${item.product.title} 재고가 부족합니다.` };
    }
  }

  const bySeller = new Map<string, typeof cart.items>();
  for (const item of cart.items) {
    const list = bySeller.get(item.product.sellerId) ?? [];
    list.push(item);
    bySeller.set(item.product.sellerId, list);
  }

  const totalKrw = cart.items.reduce(
    (sum, item) => sum + item.product.priceKrw * item.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        buyerId: session.sub,
        totalKrw,
        recipientName: parsed.data.recipientName,
        recipientPhone: parsed.data.recipientPhone,
        addressLine: parsed.data.addressLine,
      },
    });

    for (const [sellerId, items] of bySeller) {
      const subtotalKrw = items.reduce(
        (sum, item) => sum + item.product.priceKrw * item.quantity,
        0
      );
      await tx.suborder.create({
        data: {
          orderId: createdOrder.id,
          sellerId,
          subtotalKrw,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              titleSnapshot: item.product.title,
              priceKrwSnapshot: item.product.priceKrw,
              quantity: item.quantity,
            })),
          },
        },
      });

      // 체크아웃 전 재고 확인(위 for문)은 트랜잭션 시작 전 시점의 스냅샷이라, 동시에 여러
      // 구매자가 마지막 재고를 주문하면 둘 다 통과할 수 있다. 실제 차감은 "재고가 충분할
      // 때만" 조건부로 수행되는 updateMany로 원자적으로 재검증해, 둘 중 하나만 성공하게 한다.
      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stockQty: { gte: item.quantity } },
          data: { stockQty: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error("OUT_OF_STOCK");
        }
      }
    }

    await tx.payment.create({
      data: { orderId: createdOrder.id, amountKrw: totalKrw },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return createdOrder;
  }).catch((e) => {
    if (e instanceof Error && e.message === "OUT_OF_STOCK") return null;
    throw e;
  });

  if (!order) {
    return {
      error: "주문 처리 중 재고가 부족해졌습니다. 장바구니를 확인한 뒤 다시 시도해 주세요.",
    };
  }

  revalidatePath("/cart");
  redirect(`/orders/${order.id}`);
}

export async function confirmMockPaymentAction(orderId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  // 본인이 방치해둔 주문이 타임아웃을 넘긴 뒤 뒤늦게 "결제 확인"을 눌렀을 수 있다 —
  // 먼저 전역 소거를 돌려 이미 만료됐다면 CANCELLED로 정리되게 한다(아래 상태 확인이
  // 이를 자연스럽게 걸러냄).
  await releaseExpiredOrders();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.sub || order.status !== "CREATED") {
    revalidatePath(`/orders/${orderId}`);
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
  ]);

  await logNotification({
    userId: order.buyerId,
    type: "ORDER_PAID",
    subject: "결제가 확인되었습니다",
    body: `주문 #${order.id.slice(-8)}의 결제가 확인되었습니다.`,
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}

const NEXT_SUBORDER_STATUS: Record<string, string | undefined> = {
  PENDING: "PREPARING",
  PREPARING: "SHIPPED",
  SHIPPED: "COMPLETED",
};

export async function advanceSuborderStatusAction(
  suborderId: string
): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const suborder = await prisma.suborder.findUnique({
    where: { id: suborderId },
    include: { seller: true, order: true },
  });
  if (!suborder || suborder.seller.userId !== session.sub) return;

  const next = NEXT_SUBORDER_STATUS[suborder.status];
  if (!next || suborder.order.status !== "PAID") return;

  await prisma.suborder.update({
    where: { id: suborderId },
    data: { status: next as "PREPARING" | "SHIPPED" | "COMPLETED" },
  });

  if (next === "SHIPPED") {
    await logNotification({
      userId: suborder.order.buyerId,
      type: "SUBORDER_SHIPPED",
      subject: "배송이 시작되었습니다",
      body: `주문 #${suborder.order.id.slice(-8)}의 배송이 시작되었습니다.`,
    });
  } else if (next === "COMPLETED") {
    await logNotification({
      userId: suborder.order.buyerId,
      type: "SUBORDER_COMPLETED",
      subject: "배송이 완료되었습니다",
      body: `주문 #${suborder.order.id.slice(-8)}의 배송이 완료되었습니다.`,
    });
  }

  revalidatePath("/seller/orders");
  revalidatePath(`/orders/${suborder.orderId}`);
  revalidatePath("/orders");
}

export async function cancelOrderAction(orderId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, suborders: { include: { items: true } } },
  });
  if (!order || order.buyerId !== session.sub) return;
  if (order.status === "CANCELLED") return;

  const cancelled = await prisma.$transaction(async (tx) => {
    // 두 번의 취소 요청이 동시에 들어오면 둘 다 위의 상태 확인(트랜잭션 밖, 스냅샷 기준)을
    // 통과할 수 있다. 재고를 두 번 복구하지 않도록, 상태 전환 자체를 조건부 updateMany로
    // 한 번만 성공하게 만들고, 실패하면(이미 다른 요청이 취소 처리함) 나머지를 건너뛴다.
    const result = await tx.order.updateMany({
      where: { id: orderId, status: { not: "CANCELLED" } },
      data: { status: "CANCELLED" },
    });
    if (result.count === 0) {
      throw new Error("ALREADY_CANCELLED");
    }

    for (const suborder of order.suborders) {
      for (const item of suborder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.quantity } },
        });
      }
      await tx.suborder.update({
        where: { id: suborder.id },
        data: { status: "CANCELLED" },
      });
    }

    if (order.payment) {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: order.payment.status === "CONFIRMED" ? "REFUNDED" : "FAILED",
        },
      });
    }
    return true;
  }).catch((e) => {
    if (e instanceof Error && e.message === "ALREADY_CANCELLED") return false;
    throw e;
  });

  if (cancelled) {
    await logNotification({
      userId: order.buyerId,
      type: "ORDER_CANCELLED",
      subject: "주문이 취소되었습니다",
      body: `주문 #${order.id.slice(-8)}이 취소되었습니다.`,
    });
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}
