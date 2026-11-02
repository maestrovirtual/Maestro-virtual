import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  sessionCookieOptions,
  USER_SESSION_COOKIE,
  USER_SESSION_DURATION_SECONDS,
} from "@/lib/auth/session";
import { normalizeEmail } from "@/lib/auth/account";
import { clientIp, createRateLimiter } from "@/lib/auth/rate-limit";

const isRateLimited = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

// Mismo mensaje para correo inexistente, contraseña incorrecta o cuenta de
// staff (que entra por /staff/login): no se revela que cuentas existen.
const INVALID_CREDENTIALS = "Correo o contraseña incorrectos";

// ==========================================
// POST: Iniciar sesion de un usuario final
// ==========================================
export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "El correo y la contraseña son obligatorios" },
      { status: 400 }
    );
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." },
      { status: 429 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, hashedPassword: true },
    });

    if (!user) {
      // Se calcula un hash igualmente para que el tiempo de respuesta no
      // delate si el correo existe.
      await hashPassword(password);
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const validPassword = await verifyPassword(password, user.hashedPassword);
    if (!validPassword || user.role !== "USER") {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const token = await createSessionToken(
      { userId: user.id, role: "USER" },
      USER_SESSION_DURATION_SECONDS
    );
    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(
      USER_SESSION_COOKIE,
      token,
      sessionCookieOptions(USER_SESSION_DURATION_SECONDS)
    );
    return response;
  } catch (error) {
    console.error("Error en el login de usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al iniciar sesión" },
      { status: 500 }
    );
  }
}
