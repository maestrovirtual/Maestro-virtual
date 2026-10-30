import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { passwordError } from "@/lib/auth/account";
import { hashResetToken } from "@/lib/auth/password-reset";
import { sessionCookieOptions, USER_SESSION_COOKIE } from "@/lib/auth/session";

const INVALID_LINK = "El enlace no es válido o ya expiró. Solicita uno nuevo.";
const MAX_TOKEN_LENGTH = 128;

// ==========================================
// POST: Elegir una nueva contraseña con el enlace del correo
// ==========================================
export async function POST(request: Request) {
  let body: { token?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token || token.length > MAX_TOKEN_LENGTH) {
    return NextResponse.json({ error: INVALID_LINK }, { status: 400 });
  }
  const invalidPassword = passwordError(password);
  if (invalidPassword) {
    return NextResponse.json({ error: invalidPassword }, { status: 400 });
  }

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
      select: { id: true, userId: true, expiresAt: true, usedAt: true, user: { select: { role: true } } },
    });
    if (!record || record.usedAt || record.expiresAt <= new Date() || record.user.role !== "USER") {
      return NextResponse.json({ error: INVALID_LINK }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const now = new Date();

    const changed = await prisma.$transaction(async (tx) => {
      // Se marca como usado de forma atomica: si el enlace se envia dos
      // veces a la vez, solo una peticion cambia la contraseña.
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) return false;

      // passwordChangedAt invalida las sesiones abiertas en otros dispositivos.
      await tx.user.update({
        where: { id: record.userId },
        data: { hashedPassword, passwordChangedAt: now },
      });
      await tx.passwordResetToken.deleteMany({
        where: { userId: record.userId, id: { not: record.id } },
      });
      return true;
    });

    if (!changed) {
      return NextResponse.json({ error: INVALID_LINK }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(USER_SESSION_COOKIE, "", sessionCookieOptions(0));
    return response;
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al cambiar la contraseña" },
      { status: 500 }
    );
  }
}
