import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

const SALT_ROUNDS = 10;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7일

export type SessionRole = "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";

export type SessionPayload = {
  sub: string;
  role: SessionRole;
  name: string;
};

function getAuthSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET 환경변수가 설정되지 않았습니다. .env.local을 확인하세요."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getAuthSecretKey());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      role: payload.role as SessionRole,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "tansaeng_session";
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/// 관리자 2단계 인증(TOTP) 중간 상태. 비밀번호 검증은 통과했지만 TOTP 코드를 아직
/// 확인하지 않은 사용자에게 발급하는 짧은 수명의 별도 쿠키 — 이 토큰만으로는 어떤
/// 보호된 라우트에도 접근할 수 없다(proxy.ts는 SESSION_COOKIE_NAME만 확인).
const MFA_PENDING_TTL_SECONDS = 5 * 60;

export type MfaPendingPayload = { sub: string };

export async function signMfaPending(
  payload: MfaPendingPayload
): Promise<string> {
  return new SignJWT({ purpose: "mfa_pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MFA_PENDING_TTL_SECONDS}s`)
    .sign(getAuthSecretKey());
}

export async function verifyMfaPending(
  token: string
): Promise<MfaPendingPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey());
    if (payload.purpose !== "mfa_pending" || typeof payload.sub !== "string") {
      return null;
    }
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

export const MFA_PENDING_COOKIE_NAME = "tansaeng_mfa_pending";
export const MFA_PENDING_MAX_AGE = MFA_PENDING_TTL_SECONDS;
