import "server-only";
import { prisma } from "@/lib/db";

/// 실제 이메일/푸시 발송 없이(NOTIFICATION_PROVIDER=mock), "이 시점에 알림이 발송되었을
/// 것"이라는 기록만 남긴다. 거래 알림(주문/배송/문의 답변 등)만 호출 대상 — 광고성 알림은
/// 실제 보낼 콘텐츠가 없어 호출하지 않는다.
export async function logNotification(params: {
  userId: string;
  type: string;
  subject: string;
  body?: string;
}): Promise<void> {
  await prisma.notificationLog.create({ data: params });
}
