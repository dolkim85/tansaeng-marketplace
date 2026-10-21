"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createSessionCookie, clearSessionCookie } from "@/server/session";

export type AuthFormState = { error?: string } | undefined;

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력하세요."),
});

/// 로그인 무차별대입 방어(마스터 문서 16장 "rate limit"). 연속 실패 시 계정 단위로
/// 일시 잠금한다 — IP 기반 제한은 실제 배포(M4) 시 리버스 프록시/WAF 레이어에서
/// 처리하는 것이 적절해 이번 범위에서는 제외(docs/PRODUCT_DECISIONS.md 참고).
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

const registerSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요."),
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

function homePathForRole(role: string): string {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/admin";
  if (role === "SELLER") return "/seller";
  return "/";
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  // 이미 잠긴 계정이면 비밀번호 검증 없이 즉시 거부(불필요한 해시 연산 방지 +
  // 무차별대입 시도에 일관된 응답).
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return {
      error: `로그인 시도가 너무 많아 일시적으로 잠겼습니다. ${minutesLeft}분 후 다시 시도하세요.`,
    };
  }

  const passwordOk = await verifyPassword(
    parsed.data.password,
    user.passwordHash
  );
  if (!passwordOk) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= MAX_FAILED_LOGIN_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // 잠금 발동 시 카운터를 초기화해, 잠금이 풀린 뒤에는 다시 0부터 센다.
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOGIN_LOCKOUT_MS) : null,
      },
    });
    if (shouldLock) {
      return {
        error: `로그인 시도가 너무 많아 ${LOGIN_LOCKOUT_MS / 60000}분간 계정이 잠겼습니다.`,
      };
    }
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  if (user.status === "SUSPENDED") {
    return { error: "정지된 계정입니다. 고객센터에 문의하세요." };
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  await createSessionCookie({ sub: user.id, role: user.role, name: user.name });
  redirect(homePathForRole(user.role));
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "이미 가입된 이메일입니다." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "BUYER",
    },
  });

  await createSessionCookie({ sub: user.id, role: user.role, name: user.name });
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/auth/login");
}
