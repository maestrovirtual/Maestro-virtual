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

export async function sendContactEmail(payload: ContactEmailPayload) {
  const name = escapeHtml(payload.name);
  const email = escapeHtml(payload.email);
  const subject = escapeHtml(payload.subject);
  const message = escapeHtml(payload.message).replace(/\n/g, "<br>");

  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: process.env.CONTACT_EMAIL!,
    replyTo: payload.email,
    subject: `[Maestro Virtual] ${payload.subject}`,
    html: `
      <h2>Nuevo mensaje del formulario de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Asunto:</strong> ${subject}</p>
      <hr />
      <h3>Mensaje</h3>
      <p>${message}</p>
    `,
  });
}
