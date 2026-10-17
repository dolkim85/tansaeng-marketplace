import "server-only";
import { prisma } from "@/lib/db";

const DEFAULT_PREFERENCE = { marketingEmailOptIn: false, marketingPushOptIn: false };

export async function getNotificationPreference(userId: string) {
  const pref = await prisma.notificationPreference.findUnique({ where: { userId } });
  return pref ?? DEFAULT_PREFERENCE;
}
