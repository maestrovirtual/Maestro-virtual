import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { routing } from "@/i18n/routing";
import { isValidEmail, normalizeEmail } from "@/lib/auth/account";
import {
  generateResetToken,
  resetLinkOrigin,
  RESET_REQUEST_COOLDOWN_MS,
  RESET_TOKEN_TTL_MS,
} from "@/lib/auth/password-reset";
import { clientIp, createRateLimiter } from "@/lib/auth/rate-limit";
import { sendPasswordResetEmail } from "@/services/mail/sendPasswordResetEmail";

const isRateLimited = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

// Misma respuesta si el correo no tiene cuenta, si es de staff (su contraseña
// se administra con `npm run staff:create`) o si ya se mando un enlace hace poco.
const GENERIC_RESPONSE = {
  ok: true,
  message: "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.",
};

// ==========================================
// POST: Enviar enlace para restablecer la contraseña
// ==========================================
export async function POST(request: Request) {
  let body: { email?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const email = normalizeEmail(body?.email);
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Escribe un correo válido" }, { status: 400 });
  }
  const locale =
    typeof body?.locale === "string" &&
    (routing.locales as readonly string[]).includes(body.locale)
      ? body.locale
      : routing.defaultLocale;

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." },
      { status: 429 }
    );
  }

  const origin = resetLinkOrigin(request);
  if (!origin) {
    console.error("NEXT_PUBLIC_APP_URL no esta configurada: no se puede armar el enlace de recuperación");
    return NextResponse.json(
      { error: "Por ahora no podemos enviar el correo. Intenta más tarde." },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user || user.role !== "USER") {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const recent = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESET_REQUEST_COOLDOWN_MS) } },
      select: { id: true },
    });
    if (recent) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    // Solo el enlace mas reciente sirve: se borran los anteriores.
    const { token, tokenHash } = generateResetToken();
    const [, record] = await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
        select: { id: true },
      }),
    ]);

    const resetUrl = `${origin}/${locale}/reset-password?token=${token}`;
    const { error } = await sendPasswordResetEmail({
      id: record.id,
      to: user.email,
      name: user.name,
      resetUrl,
    });

    if (error) {
      console.error("Error al enviar el correo de recuperación:", error);
      // Sin correo el enlace no sirve; se borra para que pueda pedir otro ya.
      await prisma.passwordResetToken.delete({ where: { id: record.id } }).catch(() => {});
      return NextResponse.json(
        { error: "No pudimos enviar el correo. Intenta de nuevo en unos minutos." },
        { status: 502 }
      );
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error("Error al solicitar la recuperación de contraseña:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al enviar el enlace" },
      { status: 500 }
    );
  }
}
