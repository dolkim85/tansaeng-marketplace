"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";

export type CheckoutFormState = { error?: string } | undefined;

const checkoutSchema = z.object({
  recipientName: z.string().min(1, "받는 분 성함을 입력하세요."),
  recipientPhone: z.string().min(9, "연락처를 입력하세요."),
  addressLine: z.string().min(5, "배송지 주소를 입력하세요."),
});

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

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }
    }

    await tx.payment.create({
      data: { orderId: createdOrder.id, amountKrw: totalKrw },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return createdOrder;
  });

  revalidatePath("/cart");
  redirect(`/orders/${order.id}`);
}

export async function confirmMockPaymentAction(orderId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.sub || order.status !== "CREATED") {
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
  ]);

  revalidatePath(`/orders/${orderId}`);
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

  await prisma.$transaction(async (tx) => {
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

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    if (order.payment) {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: order.payment.status === "CONFIRMED" ? "REFUNDED" : "FAILED",
        },
      });
    }
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}
