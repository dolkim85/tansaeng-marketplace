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
