"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { logAdminAction } from "@/server/audit/log";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

export type SettingsFormState = { error?: string } | undefined;

const commissionRateSchema = z.object({
  // 입력은 사람이 읽는 퍼센트(예: 5), 저장은 비율(0.05)로 변환한다.
  commissionPercent: z.coerce.number().min(0, "0% 이상이어야 합니다.").max(100, "100% 이하여야 합니다."),
});

/// 중개수수료율 변경(마스터 문서 11.1절 "구체 수수료율은 관리자 설정"). 이 값은 다음
/// 정산 배치 생성부터 적용되며, 이미 생성된 과거 Settlement.commissionRate는 그대로
/// 유지된다(runSettlementAction이 생성 시점 값을 스냅샷으로 저장하기 때문).
export async function updateCommissionRateAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await requireAdmin();

  const parsed = commissionRateSchema.safeParse({
    commissionPercent: formData.get("commissionPercent"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const commissionRate = parsed.data.commissionPercent / 100;

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: { commissionRate, updatedBy: session.sub },
    create: { id: "default", commissionRate, updatedBy: session.sub },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "COMMISSION_RATE_UPDATED",
    targetType: "PlatformSettings",
    targetId: "default",
    detail: `${parsed.data.commissionPercent}%`,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settlements");
  revalidatePath("/seller/settlements");
  return undefined;
}
