import "server-only";
import { prisma } from "@/lib/db";

export async function listSellerApplications() {
  return prisma.sellerApplication.findMany({
    include: { seller: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllProductsForAdmin() {
  return prisma.product.findMany({
    include: { seller: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}
