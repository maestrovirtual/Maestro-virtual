import { NextResponse } from "next/server";
import { resend } from "@/lib/mail/resend";
// Temporary endpoint to verify Resend integration.
// Remove after contact form integration.
export async function GET() {
  try {
    const email = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.CONTACT_EMAIL!,
      subject: "Prueba de correo - Maestro Virtual",
      html: `
        <h1>Correo funcionando 🚀</h1>
        <p>La integración con Resend está funcionando correctamente.</p>
        <p>Este correo fue enviado desde el entorno de desarrollo.</p>
      `,
    });

    return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        id: email.data?.id,
        });

  } catch (error) {
    console.error("Email error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email",
      },
      {
        status: 500,
      }
    );
  }
}