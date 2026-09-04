import { NextResponse } from "next/server";
import { sendContactEmail } from "@/services/mail/sendContactEmail";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

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

  const { name, email, subject, message } = (body ?? {}) as Record<string, unknown>;

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

  if (!EMAIL_PATTERN.test(emailTrim)) {
    return NextResponse.json(
      { success: false, error: "Correo inválido" },
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
