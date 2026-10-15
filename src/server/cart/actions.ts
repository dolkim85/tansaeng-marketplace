"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";

export async function addToCartAction(
  productId: string,
  productSlug: string
): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect(`/auth/login?from=/products/${productSlug}`);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ON_SALE") {
    return;
  }

  const cart = await prisma.cart.upsert({
    where: { userId: session.sub },
    update: {},
    create: { userId: session.sub },
  });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: 1 },
    });
  }

  revalidatePath("/cart");
  revalidatePath(`/products/${productSlug}`);
}

export async function updateCartItemQuantityAction(
  cartItemId: string,
  quantity: number
): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/cart");

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== session.sub) return;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  revalidatePath("/cart");
}

export async function removeCartItemAction(cartItemId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/cart");

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== session.sub) return;

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/cart");
}
