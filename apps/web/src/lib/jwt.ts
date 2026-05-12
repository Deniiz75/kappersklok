import { SignJWT, jwtVerify, type JWTPayload } from "jose";

let cachedSecret: Uint8Array | null = null;

export function getJwtSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET environment variable is required and must be at least 32 characters",
    );
  }
  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

export async function signSessionToken(
  payload: JWTPayload,
  expirationTime: string,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expirationTime)
    .sign(getJwtSecret());
}

export async function verifySessionToken<T = JWTPayload>(
  token: string,
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as T;
  } catch {
    return null;
  }
}

export interface AdminBarberSession extends JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const SESSION_COOKIE_NAME = "kk_session";

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: maxAgeSeconds,
    path: "/",
  };
}

export const SESSION_MAX_AGE_DAYS = 14;
