"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
  generateTotpSecret,
  verifyTotpCode,
  generateRecoveryCodes,
} from "@/lib/totp";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

export type MfaFormState =
  | { error?: string; success?: boolean; recoveryCodes?: string[] }
  | undefined;

/// 2단계 인증 등록을 새로 시작(또는 재시작)한다. 아직 확정(totpEnabled=true)되지
/// 않은 상태이므로 언제든 다시 호출해 새 secret으로 덮어써도 안전하다.
export async function startMfaEnrollmentAction(): Promise<void> {
  const session = await requireAdmin();
  const secret = generateTotpSecret();

  await prisma.user.update({
    where: { id: session.sub },
    data: { totpSecret: secret, totpEnabled: false, totpRecoveryCodes: [] },
  });

  revalidatePath("/admin/settings/mfa");
  redirect("/admin/settings/mfa");
}

export async function cancelMfaEnrollmentAction(): Promise<void> {
  const session = await requireAdmin();

  await prisma.user.update({
    where: { id: session.sub },
    data: { totpSecret: null, totpEnabled: false, totpRecoveryCodes: [] },
  });

  revalidatePath("/admin/settings/mfa");
  redirect("/admin/settings");
}

const codeSchema = z.object({
  code: z.string().min(1, "인증번호를 입력하세요."),
});

/// 등록 중인 secret으로 코드를 한 번 확인해 실제로 동기화됐는지 검증한 뒤에만
/// 2단계 인증을 활성화한다(틀린 secret을 등록 앱에 넣고도 모르는 상황 방지).
export async function confirmMfaEnrollmentAction(
  _prevState: MfaFormState,
  formData: FormData
): Promise<MfaFormState> {
  const session = await requireAdmin();

  const parsed = codeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || user.totpEnabled || !user.totpSecret) {
    return { error: "진행 중인 등록이 없습니다. 다시 시작하세요." };
  }

  if (!verifyTotpCode(user.totpSecret, parsed.data.code.trim())) {
    return { error: "인증번호가 올바르지 않습니다. 인증 앱의 시간이 맞는지 확인하세요." };
  }

  const recoveryCodes = generateRecoveryCodes();
  const hashes = await Promise.all(recoveryCodes.map((c) => hashPassword(c)));

  await prisma.user.update({
    where: { id: session.sub },
    data: { totpEnabled: true, totpRecoveryCodes: hashes },
  });

  // /admin/settings/mfa는 일부러 재검증하지 않는다 — 이 화면(ConfirmMfaForm)이 복구
  // 코드를 1회성으로 보여주는 중인데, 같은 경로를 재검증하면 상위 서버 컴포넌트가
  // 새로고침되어 totpEnabled=true로 바뀐 분기("관리" 화면)로 즉시 바뀌면서 지금 막
  // 반환한 복구 코드 state가 통째로 사라진다(유저가 저장할 기회를 잃음). 사용자가
  // 코드 확인 후 직접 "설정으로 돌아가기"를 눌러야 다음 화면으로 넘어간다.
  revalidatePath("/admin/settings");
  return { success: true, recoveryCodes };
}

async function verifyCurrentMfaCode(
  userId: string,
  rawCode: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.totpEnabled || !user.totpSecret) return false;

  const code = rawCode.trim();
  if (verifyTotpCode(user.totpSecret, code)) return true;

  for (const hash of user.totpRecoveryCodes) {
    if (await verifyPassword(code, hash)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totpRecoveryCodes: user.totpRecoveryCodes.filter((h) => h !== hash),
        },
      });
      return true;
    }
  }
  return false;
}

/// 2단계 인증 비활성화. 세션을 이미 가진 공격자가 탈취한 쿠키만으로 끌 수 없도록
/// 현재 TOTP 코드(또는 복구 코드) 확인을 요구한다.
export async function disableMfaAction(
  _prevState: MfaFormState,
  formData: FormData
): Promise<MfaFormState> {
  const session = await requireAdmin();

  const parsed = codeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const ok = await verifyCurrentMfaCode(session.sub, parsed.data.code);
  if (!ok) {
    return { error: "인증번호가 올바르지 않습니다." };
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: { totpSecret: null, totpEnabled: false, totpRecoveryCodes: [] },
  });

  // 비활성화는(복구 코드처럼) 1회성으로 보여줘야 할 비밀 데이터가 없으므로
  // 클라이언트 state로 성공 메시지를 돌려주는 대신 바로 리다이렉트한다 —
  // startMfaEnrollmentAction/cancelMfaEnrollmentAction과 동일한, 검증된 패턴.
  revalidatePath("/admin/settings");
  redirect("/admin/settings?mfaDisabled=1");
}

export async function regenerateRecoveryCodesAction(
  _prevState: MfaFormState,
  formData: FormData
): Promise<MfaFormState> {
  const session = await requireAdmin();

  const parsed = codeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const ok = await verifyCurrentMfaCode(session.sub, parsed.data.code);
  if (!ok) {
    return { error: "인증번호가 올바르지 않습니다." };
  }

  const recoveryCodes = generateRecoveryCodes();
  const hashes = await Promise.all(recoveryCodes.map((c) => hashPassword(c)));

  await prisma.user.update({
    where: { id: session.sub },
    data: { totpRecoveryCodes: hashes },
  });

  revalidatePath("/admin/settings");
  return { success: true, recoveryCodes };
}
