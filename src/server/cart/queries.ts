import "server-only";
import { prisma } from "@/lib/db";

export async function getCartForUser(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { seller: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const items = cart?.items ?? [];
  const totalKrw = items.reduce(
    (sum, item) => sum + item.product.priceKrw * item.quantity,
    0
  );

  return { cart, items, totalKrw };
}
