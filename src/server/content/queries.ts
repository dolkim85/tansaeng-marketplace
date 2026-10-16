import "server-only";
import { prisma } from "@/lib/db";

export async function getActiveBanner() {
  return prisma.banner.findFirst({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function listAllBannersForAdmin() {
  return prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function listRecentNotices(limit: number) {
  return prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function listAllNoticesForAdmin() {
  return prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}

export async function listFaqs() {
  return prisma.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
