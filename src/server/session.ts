import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  type SessionPayload,
  signSession,
  verifySession,
  MFA_PENDING_COOKIE_NAME,
  MFA_PENDING_MAX_AGE,
  signMfaPending,
  verifyMfaPending,
} from "@/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function createSessionCookie(
  payload: SessionPayload
): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function createMfaPendingCookie(userId: string): Promise<void> {
  const token = await signMfaPending({ sub: userId });
  const store = await cookies();
  store.set(MFA_PENDING_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MFA_PENDING_MAX_AGE,
  });
}

export async function getMfaPendingUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(MFA_PENDING_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyMfaPending(token);
  return payload?.sub ?? null;
}

export async function clearMfaPendingCookie(): Promise<void> {
  const store = await cookies();
  store.delete(MFA_PENDING_COOKIE_NAME);
}
