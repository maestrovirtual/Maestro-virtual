import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  sessionCookieOptions,
  USER_SESSION_COOKIE,
  USER_SESSION_DURATION_SECONDS,
} from "@/lib/auth/session";
import { isValidEmail, MAX_NAME_LENGTH, normalizeEmail, passwordError } from "@/lib/auth/account";
import { clientIp, createRateLimiter } from "@/lib/auth/rate-limit";

const isRateLimited = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });

const EMAIL_TAKEN = "Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.";

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "P2002");
}

// ==========================================
// POST: Registrar un usuario final (inicia su sesion)
// ==========================================
export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `Escribe tu nombre (máximo ${MAX_NAME_LENGTH} caracteres)` },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Escribe un correo válido" }, { status: 400 });
  }
  const invalidPassword = passwordError(password);
  if (invalidPassword) {
    return NextResponse.json({ error: invalidPassword }, { status: 400 });
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." },
      { status: 429 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: EMAIL_TAKEN }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { name, email, hashedPassword: await hashPassword(password), role: "USER" },
      select: { id: true },
    });

    const token = await createSessionToken(
      { userId: user.id, role: "USER" },
      USER_SESSION_DURATION_SECONDS
    );
    const response = NextResponse.json({ ok: true }, { status: 201 });
    response.cookies.set(
      USER_SESSION_COOKIE,
      token,
      sessionCookieOptions(USER_SESSION_DURATION_SECONDS)
    );
    return response;
  } catch (error) {
    // Dos registros simultaneos con el mismo correo: el segundo choca con @unique.
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: EMAIL_TAKEN }, { status: 409 });
    }
    console.error("Error al registrar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear la cuenta" },
      { status: 500 }
    );
  }
}
