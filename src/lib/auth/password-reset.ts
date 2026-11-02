import { createHash, randomBytes } from "node:crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
// No se manda otro enlace si el ultimo se pidio hace menos de esto.
export const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;

// El token tiene 256 bits aleatorios, asi que no hace falta un hash lento
// como el de las contraseñas: SHA-256 basta para no guardarlo en claro.
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

// Origen para armar el enlace del correo. Nunca se usa el Host de la
// peticion en produccion: alguien podria pedir el enlace de otra persona con
// un Host falso y recibir el token en su propio dominio.
export function resetLinkOrigin(request: Request): string | null {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
    } catch {
      // Valor mal escrito: se intenta con las demas opciones.
    }
  }

  // La define Vercel en cada despliegue (incluidos los previews).
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  if (process.env.NODE_ENV !== "production") return new URL(request.url).origin;
  return null;
}
