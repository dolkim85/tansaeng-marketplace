"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";

export async function toggleWishlistAction(
  productId: string,
  productSlug: string
): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect(`/auth/login?from=/products/${productSlug}`);
  }

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.sub, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlist.create({
      data: { userId: session.sub, productId },
    });
  }

  revalidatePath(`/products/${productSlug}`);
  revalidatePath("/wishlist");
}

export async function toggleFollowAction(
  sellerId: string,
  sellerSlug: string
): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect(`/auth/login?from=/farms/${sellerSlug}`);
  }

  const existing = await prisma.sellerFollow.findUnique({
    where: { userId_sellerId: { userId: session.sub, sellerId } },
  });

  if (existing) {
    await prisma.sellerFollow.delete({ where: { id: existing.id } });
  } else {
    await prisma.sellerFollow.create({
      data: { userId: session.sub, sellerId },
    });
  }

  revalidatePath(`/farms/${sellerSlug}`);
  revalidatePath("/following");
}
