import "server-only";
import { prisma } from "@/lib/db";

export async function listPolicyVersions() {
  return prisma.policyVersion.findMany({
    orderBy: [{ title: "asc" }, { createdAt: "desc" }],
  });
}
