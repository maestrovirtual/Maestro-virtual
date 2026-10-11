import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/session";

// Mismo mensaje para correo inexistente, contraseña incorrecta o usuario
// sin rol staff: no se revela que cuentas existen.
const INVALID_CREDENTIALS = "Correo o contraseña incorrectos";

// ==========================================
// POST: Iniciar sesion de staff
// ==========================================
export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida" }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "El correo y la contraseña son obligatorios" },
      { status: 400 }
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
    if (!validPassword || user.role !== "STAFF") {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const token = await createSessionToken({ userId: user.id, role: user.role });
    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Error en el login de staff:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al iniciar sesion" },
      { status: 500 }
    );
  }
}
