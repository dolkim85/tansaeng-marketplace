import { prisma } from "@/lib/db";

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function getDefaultAddress(userId: string) {
  return prisma.address.findFirst({
    where: { userId, isDefault: true },
  });
}
