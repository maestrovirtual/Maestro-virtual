import { resend } from "@/lib/mail/resend";

export type ContactEmailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(payload: ContactEmailPayload): string {
  const name = escapeHtml(payload.name);
  const email = escapeHtml(payload.email);
  const subject = escapeHtml(payload.subject);
  const message = escapeHtml(payload.message).replace(/\n/g, "<br>");
  const sentAt = new Date().toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  });

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Nuevo mensaje de contacto</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#1d4ed8 0%,#0891b2 100%);padding:32px 32px 28px;color:#ffffff;">
                  <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;">Maestro Virtual</p>
                  <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;line-height:1.3;">Nuevo mensaje de contacto</h1>
                  <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">${sentAt}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px 8px;">
                  <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#475569;">
                    Recibiste un mensaje nuevo desde el formulario de contacto del sitio.
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                    <tr>
                      <td style="padding:14px 18px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;">
                        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Nombre</p>
                        <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${name}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;">
                        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Correo</p>
                        <p style="margin:4px 0 0;font-size:15px;font-weight:600;">
                          <a href="mailto:${email}" style="color:#1d4ed8;text-decoration:none;">${email}</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 18px;background-color:#f8fafc;">
                        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Asunto</p>
                        <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${subject}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 28px;">
                  <p style="margin:20px 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Mensaje</p>
                  <div style="padding:18px 20px;background-color:#f8fafc;border-left:4px solid #1d4ed8;border-radius:8px;font-size:15px;line-height:1.6;color:#1e293b;white-space:pre-wrap;">
                    ${message}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;background-color:#f8fafc;">
                  <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">
                    Puedes responder directamente a este correo para contestarle a
                    <a href="mailto:${email}" style="color:#1d4ed8;text-decoration:none;">${name}</a>.
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;">
              Enviado automáticamente desde el formulario de contacto de Maestro Virtual.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `.trim();
}

export async function sendContactEmail(payload: ContactEmailPayload) {
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: process.env.CONTACT_EMAIL!,
    replyTo: payload.email,
    subject: `[Maestro Virtual] ${payload.subject}`,
    html: buildHtml(payload),
  });
}
