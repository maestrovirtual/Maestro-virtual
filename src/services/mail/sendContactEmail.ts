import { resend } from "@/lib/mail/resend";

export async function sendContactEmail() {
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "maestrovirtualorg@gmail.com",
    subject: "Prueba de integración - Maestro Virtual",
    html: `
      <h2>¡Integración exitosa! 🎉</h2>

      <p>Este correo fue enviado desde Resend utilizando Next.js.</p>

      <p>La integración del servicio de correo se realizó correctamente.</p>
    `,
  });
}