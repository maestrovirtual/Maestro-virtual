// Reglas de las cuentas de usuarios finales (MV-36). Sin dependencias de
// servidor: las usan tanto los formularios (cliente) como la API.

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_NAME_LENGTH = 120;

const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

// Devuelve el mensaje para el usuario, o null si la contraseña es aceptable.
export function passwordError(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `La contraseña no puede tener más de ${MAX_PASSWORD_LENGTH} caracteres`;
  }
  return null;
}

// Destino despues del login (?next=...). Solo se aceptan rutas del mismo
// sitio: se interpreta igual que lo haria el navegador para que variantes
// como "//otro.sitio" o "/\otro.sitio" no se conviertan en una redireccion
// abierta. Debe incluir el idioma, por ejemplo "/es/courses/excel".
export function safeNextPath(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;

  const base = "http://localhost";
  try {
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
