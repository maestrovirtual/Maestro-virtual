import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "mv_staff_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 8;

const MIN_SECRET_LENGTH = 32;
const ALGORITHM = "HS256";

export type SessionPayload = {
  userId: string;
  role: Role;
};

// Se lee en cada llamada (no al importar) para que el build no falle
// cuando AUTH_SECRET no existe, y para fallar cerrado en runtime.
function getSecretKey(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const key = getSecretKey();
  if (!key) {
    throw new Error(
      `AUTH_SECRET no esta configurado o tiene menos de ${MIN_SECRET_LENGTH} caracteres`
    );
  }

  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(key);
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;

  const key = getSecretKey();
  if (!key) return null;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: [ALGORITHM] });
    if (typeof payload.sub !== "string") return null;
    if (payload.role !== "USER" && payload.role !== "STAFF") return null;

    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge: number = SESSION_DURATION_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
