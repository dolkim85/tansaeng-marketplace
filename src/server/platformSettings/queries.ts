import "server-only";
import { prisma } from "@/lib/db";
import { COMMISSION_RATE } from "@/lib/settlement";

/** 전역 운영 설정 싱글톤을 가져온다(없으면 기본값으로 생성). */
export async function getPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", commissionRate: COMMISSION_RATE },
  });
}

export async function getCommissionRate(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.commissionRate;
}
