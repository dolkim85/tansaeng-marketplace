import "server-only";
import { prisma } from "@/lib/db";

export async function listAuditLogs(limit = 200) {
  return prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
