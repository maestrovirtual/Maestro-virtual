import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "mv_staff_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 8;

// Sesion de usuarios finales (MV-36). Cookie distinta a la del staff: el rol
// del token y el nombre de la cookie deben coincidir para que sea valida.
export const USER_SESSION_COOKIE = "mv_user_session";
export const USER_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

const MIN_SECRET_LENGTH = 32;
const ALGORITHM = "HS256";

export type SessionPayload = {
  userId: string;
  role: Role;
};

// issuedAt (segundos) permite descartar sesiones emitidas antes de un
// cambio de contraseña.
export type SessionClaims = SessionPayload & { issuedAt: number };

// Se lee en cada llamada (no al importar) para que el build no falle
// cuando AUTH_SECRET no existe, y para fallar cerrado en runtime.
function getSecretKey(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
  durationSeconds: number = SESSION_DURATION_SECONDS
): Promise<string> {
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
    .setExpirationTime(`${durationSeconds}s`)
    .sign(key);
}

export async function verifySessionClaims(
  token: string | undefined
): Promise<SessionClaims | null> {
  if (!token) return null;

  const key = getSecretKey();
  if (!key) return null;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: [ALGORITHM] });
    if (typeof payload.sub !== "string") return null;
    if (payload.role !== "USER" && payload.role !== "STAFF") return null;
    if (typeof payload.iat !== "number") return null;

    return { userId: payload.sub, role: payload.role, issuedAt: payload.iat };
  } catch {
    return null;
  }
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  const claims = await verifySessionClaims(token);
  return claims && { userId: claims.userId, role: claims.role };
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
