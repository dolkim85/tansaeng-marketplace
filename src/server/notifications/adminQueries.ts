import "server-only";
import { prisma } from "@/lib/db";

export async function listNotificationLogsForAdmin(limit = 200) {
  return prisma.notificationLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** 전체 회원 대비 광고성 정보 수신동의 현황(마스터 문서 13장 "동의 현황"). */
export async function getConsentSummary() {
  const [totalUsers, emailOptIn, pushOptIn] = await Promise.all([
    prisma.user.count(),
    prisma.notificationPreference.count({ where: { marketingEmailOptIn: true } }),
    prisma.notificationPreference.count({ where: { marketingPushOptIn: true } }),
  ]);
  return { totalUsers, emailOptIn, pushOptIn };
}
