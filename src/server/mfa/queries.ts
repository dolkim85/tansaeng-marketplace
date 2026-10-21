import "server-only";
import { prisma } from "@/lib/db";

export async function getMfaStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpSecret: true, totpEnabled: true, totpRecoveryCodes: true },
  });
  if (!user) return null;
  return {
    enabled: user.totpEnabled,
    // 등록이 시작됐지만(secret 존재) 아직 확인 코드로 확정되지 않은 상태.
    enrollmentPending: !user.totpEnabled && !!user.totpSecret,
    remainingRecoveryCodes: user.totpRecoveryCodes.length,
  };
}

/// MFA 설정 화면(QR/수동 입력 키 표시용). 미확정(enrollmentPending) 상태에서만 의미가 있다.
export async function getPendingTotpSecret(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpSecret: true, totpEnabled: true, email: true },
  });
  if (!user || user.totpEnabled || !user.totpSecret) return null;
  return { secret: user.totpSecret, email: user.email };
}
