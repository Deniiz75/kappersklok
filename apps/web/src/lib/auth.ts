import { cookies } from "next/headers";
import {
  signSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  CUSTOMER_COOKIE_NAME,
  sessionCookieOptions,
  SESSION_MAX_AGE_DAYS,
  CUSTOMER_MAX_AGE_DAYS,
  type AdminBarberSession,
  type CustomerSession,
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

export async function createCustomerSession(customerEmail: string) {
  const token = await signSessionToken(
    { customerEmail, role: "CUSTOMER" },
    `${CUSTOMER_MAX_AGE_DAYS}d`,
  );
  const cookieStore = await cookies();
  cookieStore.set(
    CUSTOMER_COOKIE_NAME,
    token,
    sessionCookieOptions(60 * 60 * 24 * CUSTOMER_MAX_AGE_DAYS),
  );
}

export async function getCustomerEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken<CustomerSession>(token);
  return payload?.customerEmail || null;
}

export async function destroyCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}
