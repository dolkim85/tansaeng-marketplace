import "server-only";
import { prisma } from "@/lib/db";

export async function logAdminAction(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  detail?: string;
}): Promise<void> {
  await prisma.auditLog.create({ data: params });
}
