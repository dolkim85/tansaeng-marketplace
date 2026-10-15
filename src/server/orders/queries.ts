import "server-only";
import { prisma } from "@/lib/db";

export async function getOrderDetail(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      suborders: {
        include: {
          seller: true,
          items: true,
        },
      },
    },
  });
}

export async function listOrdersForBuyer(buyerId: string) {
  return prisma.order.findMany({
    where: { buyerId },
    include: { payment: true, suborders: { include: { seller: true, items: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSubordersForSeller(sellerId: string) {
  return prisma.suborder.findMany({
    where: { sellerId },
    include: { order: true, items: true },
    orderBy: { createdAt: "desc" },
  });
}
