import { getResend } from "@/lib/mail/resend";

export type ForwardableMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  date: Date;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// A dónde se reenvían los mensajes importantes que el staff marca para que
// los lea el propietario. Mientras no exista un correo propio de Maestro
// Virtual, se reenvía a la cuenta institucional actual; el día que lo
// tengan, basta con cambiar esta variable de entorno.
export function forwardTargetEmail(): string {
  return (process.env.FORWARD_TO_EMAIL || process.env.CONTACT_EMAIL || "").trim();
}

function buildHtml(message: ForwardableMessage): string {
  const name = escapeHtml(message.name);
  const email = escapeHtml(message.email);
  const subject = escapeHtml(message.subject);
  const body = escapeHtml(message.message).replace(/\n/g, "<br>");
  const receivedAt = message.date.toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short", timeZone: "America/Mexico_City" });

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head><meta charset="utf-8" /><title>Mensaje reenviado</title></head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
        <tr><td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
            <tr><td style="background:linear-gradient(135deg,#1d4ed8 0%,#0891b2 100%);padding:28px 32px;color:#ffffff;">
              <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;">Maestro Virtual · Panel de staff</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;">Mensaje marcado para tu revisión</h1>
            </td></tr>
            <tr><td style="padding:24px 32px 8px;">
              <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#475569;">El staff reenvió este mensaje de contacto recibido el ${receivedAt} para que lo revises.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr><td style="padding:12px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;"><p style="margin:0;font-size:11px;text-transform:uppercase;color:#64748b;">De</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;">${name} &lt;<a href="mailto:${email}" style="color:#1d4ed8;">${email}</a>&gt;</p></td></tr>
                <tr><td style="padding:12px 16px;background-color:#f8fafc;"><p style="margin:0;font-size:11px;text-transform:uppercase;color:#64748b;">Asunto</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;">${subject}</p></td></tr>
              </table>
              <p style="margin:18px 0 6px;font-size:11px;text-transform:uppercase;color:#64748b;">Mensaje</p>
              <div style="padding:16px 18px;background-color:#f8fafc;border-left:4px solid #1d4ed8;border-radius:8px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${body}</div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>
  `.trim();
}

export async function forwardContactMessage(id: string, message: ForwardableMessage) {
  const to = forwardTargetEmail();
  if (!to) throw new Error("Configura FORWARD_TO_EMAIL o CONTACT_EMAIL para reenviar mensajes");
  const from = process.env.MAIL_FROM_NOTIFICATIONS?.trim() || process.env.MAIL_FROM?.trim() || "onboarding@resend.dev";
  if (!from || from === "onboarding@resend.dev") {
    throw new Error("Configura MAIL_FROM_NOTIFICATIONS para reenviar mensajes a TI");
  }
  return await getResend().emails.send(
    {
      from,
      to,
      replyTo: message.email,
      subject: `[Maestro Virtual] Reenviado: ${message.subject}`,
      html: buildHtml(message),
    },
    { idempotencyKey: `contact-forward/${id}` }
  );
}
