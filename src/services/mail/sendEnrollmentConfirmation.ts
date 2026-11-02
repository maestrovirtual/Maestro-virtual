import { getResend } from "@/lib/mail/resend";

export type EnrollmentConfirmationItem =
  | {
      type: "course";
      title: string;
      duration: string;
      modality: string;
      participants?: string;
    }
  | {
      type: "event";
      title: string;
      date: string;
      time?: string;
      duration?: string;
      modality: string;
      location?: string;
      address?: string;
      platform?: string;
    };

export type EnrollmentConfirmationPayload = {
  name: string;
  email: string;
  item: EnrollmentConfirmationItem;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function itemLabel(item: EnrollmentConfirmationItem): string {
  return item.type === "course" ? "Curso" : "Evento";
}

function itemRows(item: EnrollmentConfirmationItem): { label: string; value: string }[] {
  const rows = [{ label: itemLabel(item), value: item.title }];
  if (item.type === "event") {
    const formattedDate = new Date(`${item.date}T00:00:00`).toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    rows.push({ label: "Fecha", value: formattedDate });
    if (item.time) rows.push({ label: "Horario", value: item.time });
    if (item.duration) rows.push({ label: "Duración", value: item.duration });
    rows.push({
      label: "Modalidad",
      value: item.modality.toLowerCase() === "online"
        ? `En línea${item.platform ? ` vía ${item.platform}` : ""}`
        : `Presencial${item.location ? ` — ${item.location}` : ""}${item.address ? ` (${item.address})` : ""}`,
    });
  } else {
    rows.push({ label: "Duración", value: item.duration });
    rows.push({ label: "Modalidad", value: item.modality });
    if (item.participants) rows.push({ label: "Participantes", value: item.participants });
  }
  return rows;
}

function buildHtml(payload: EnrollmentConfirmationPayload): string {
  const name = escapeHtml(payload.name);
  const rows = itemRows(payload.item).map(
    (row) => `
      <tr>
        <td style="padding:14px 18px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">${escapeHtml(row.label)}</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${escapeHtml(row.value)}</p>
        </td>
      </tr>`
  ).join("");

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Confirmación de inscripción</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#1d4ed8 0%,#0891b2 100%);padding:32px 32px 28px;color:#ffffff;">
                  <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;">Maestro Virtual</p>
                  <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;line-height:1.3;">¡Tu inscripción quedó confirmada!</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px 8px;">
                  <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#475569;">
                    Hola ${name}, recibimos tu inscripción correctamente. Estos son los datos:
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                    ${rows}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;background-color:#f8fafc;">
                  <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">
                    Si tienes dudas, responde directamente a este correo.
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;">
              Enviado automáticamente por Maestro Virtual al confirmar tu inscripción.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `.trim();
}

export async function sendEnrollmentConfirmation(payload: EnrollmentConfirmationPayload) {
  return await getResend().emails.send({
    from: process.env.MAIL_FROM?.trim() || "onboarding@resend.dev",
    to: payload.email,
    subject: `[Maestro Virtual] Confirmación de inscripción: ${payload.item.title}`,
    html: buildHtml(payload),
  });
}
