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

export type PolicyVersionFormState = { error?: string } | undefined;

const policyVersionSchema = z.object({
  title: z.string().min(1, "약관 이름을 입력하세요.").max(80),
  version: z.string().min(1, "버전을 입력하세요.").max(30),
  content: z.string().min(1, "내용을 입력하세요.").max(20000),
});

/// 약관/정책 새 버전을 추가한다(마스터 문서 13장 policy_versions). 기존 버전은 수정·삭제하지
/// 않는다 — 과거 버전의 정확한 보존이 이 기능의 핵심 목적이다(ERD.md 참고).
export async function createPolicyVersionAction(
  _prevState: PolicyVersionFormState,
  formData: FormData
): Promise<PolicyVersionFormState> {
  const session = await requireAdmin();

  const parsed = policyVersionSchema.safeParse({
    title: formData.get("title"),
    version: formData.get("version"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const policy = await prisma.policyVersion.create({
    data: { ...parsed.data, createdBy: session.sub },
  });

  await logAdminAction({
    actorId: session.sub,
    action: "POLICY_VERSION_CREATED",
    targetType: "PolicyVersion",
    targetId: policy.id,
    detail: `${policy.title} v${policy.version}`,
  });

  revalidatePath("/admin/settings");
  return undefined;
}
