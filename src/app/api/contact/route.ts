import { NextResponse } from "next/server";
import { resolveMx } from "node:dns/promises";
import { sendContactEmail } from "@/services/mail/sendContactEmail";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const rateLimitStore = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const previous = rateLimitStore.get(ip) ?? [];
  const recent = previous.filter((t) => t > cutoff);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitStore.set(ip, recent);

  if (rateLimitStore.size > 1000) {
    for (const [key, times] of rateLimitStore) {
      const kept = times.filter((t) => t > cutoff);
      if (kept.length === 0) rateLimitStore.delete(key);
      else rateLimitStore.set(key, kept);
    }
  }

  return false;
}

function hasHeaderInjection(value: string): boolean {
  return /[\r\n]/.test(value);
}

async function domainCanReceiveMail(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Cuerpo de la petición inválido" },
      { status: 400 }
    );
  }

  const { name, email, subject, message, website } = (body ?? {}) as Record<string, unknown>;

  if (typeof website === "string" && website.trim() !== "") {
    return NextResponse.json({ success: true, id: "skipped" });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof subject !== "string" ||
    typeof message !== "string"
  ) {
    return NextResponse.json(
      { success: false, error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  const nameTrim = name.trim();
  const emailTrim = email.trim();
  const subjectTrim = subject.trim();
  const messageTrim = message.trim();

  if (!nameTrim || !emailTrim || !subjectTrim || !messageTrim) {
    return NextResponse.json(
      { success: false, error: "Todos los campos son obligatorios" },
      { status: 400 }
    );
  }

  if (
    nameTrim.length > MAX_NAME ||
    subjectTrim.length > MAX_SUBJECT ||
    messageTrim.length > MAX_MESSAGE
  ) {
    return NextResponse.json(
      { success: false, error: "Uno de los campos excede el largo permitido" },
      { status: 400 }
    );
  }

  if (
    hasHeaderInjection(nameTrim) ||
    hasHeaderInjection(emailTrim) ||
    hasHeaderInjection(subjectTrim)
  ) {
    return NextResponse.json(
      { success: false, error: "Contenido inválido en nombre, correo o asunto" },
      { status: 400 }
    );
  }

  if (!EMAIL_PATTERN.test(emailTrim)) {
    return NextResponse.json(
      { success: false, error: "Correo inválido" },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  const isReachable = await domainCanReceiveMail(emailTrim);
  if (!isReachable) {
    return NextResponse.json(
      { success: false, error: "El dominio del correo no puede recibir mensajes" },
      { status: 400 }
    );
  }

  try {
    const result = await sendContactEmail({
      name: nameTrim,
      email: emailTrim,
      subject: subjectTrim,
      message: messageTrim,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json(
        { success: false, error: "No se pudo enviar el mensaje" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error("Contact endpoint error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
