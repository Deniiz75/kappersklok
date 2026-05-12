import { cookies } from "next/headers";
import {
  signSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  SESSION_MAX_AGE_DAYS,
  type AdminBarberSession,
} from "./jwt";

export type SessionPayload = AdminBarberSession;

export async function createSession(payload: SessionPayload) {
  const token = await signSessionToken(payload, `${SESSION_MAX_AGE_DAYS}d`);
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    sessionCookieOptions(60 * 60 * 24 * SESSION_MAX_AGE_DAYS),
  );
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken<SessionPayload>(token);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
