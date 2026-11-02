import { getResend } from "@/lib/mail/resend";

export type PasswordResetEmail = {
  // Id del token: evita mandar el mismo correo dos veces si se reintenta.
  id: string;
  to: string;
  name: string;
  resetUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildText({ name, resetUrl }: PasswordResetEmail): string {
  return [
    `Hola, ${name}:`,
    "",
    "Recibimos una solicitud para restablecer la contraseña de tu cuenta en Maestro Virtual.",
    "Abre este enlace para elegir una nueva (vence en 1 hora y solo funciona una vez):",
    "",
    resetUrl,
    "",
    "Si no fuiste tú, ignora este correo: tu contraseña no cambiará.",
  ].join("\n");
}

function buildHtml(payload: PasswordResetEmail): string {
  const name = escapeHtml(payload.name);
  const resetUrl = escapeHtml(payload.resetUrl);

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Restablece tu contraseña</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#1d4ed8 0%,#0891b2 100%);padding:32px 32px 28px;color:#ffffff;">
                  <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;">Maestro Virtual</p>
                  <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;line-height:1.3;">Restablece tu contraseña</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px 8px;">
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hola, ${name}:</p>
                  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                    Usa el botón para elegir una nueva.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                    <tr>
                      <td style="border-radius:12px;background-color:#1d4ed8;">
                        <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Elegir nueva contraseña</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#64748b;">
                    El enlace vence en 1 hora y solo funciona una vez. Si el botón no abre, copia esta dirección en tu navegador:
                  </p>
                  <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;">
                    <a href="${resetUrl}" style="color:#1d4ed8;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;background-color:#f8fafc;">
                  <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">
                    Si no fuiste tú, ignora este correo: tu contraseña no cambiará.
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;">
              Enviado automáticamente por Maestro Virtual.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `.trim();
}

export async function sendPasswordResetEmail(payload: PasswordResetEmail) {
  const replyTo = process.env.MAIL_REPLY_TO?.trim() || process.env.CONTACT_EMAIL?.trim();

  return await getResend().emails.send(
    {
      from: process.env.MAIL_FROM?.trim() || "onboarding@resend.dev",
      to: payload.to,
      ...(replyTo ? { replyTo } : {}),
      subject: "Restablece tu contraseña de Maestro Virtual",
      text: buildText(payload),
      html: buildHtml(payload),
    },
    { idempotencyKey: `password-reset/${payload.id}` }
  );
}
