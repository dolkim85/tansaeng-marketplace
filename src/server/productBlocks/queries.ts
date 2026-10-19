import "server-only";
import { prisma } from "@/lib/db";

export async function listProductBlocks(productId: string) {
  return prisma.productContentBlock.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });
}
