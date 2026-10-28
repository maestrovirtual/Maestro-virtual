import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireStaffApi } from "@/lib/auth/dal";
import { forwardContactMessage } from "@/services/mail/forwardContactMessage";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireStaffApi();
    if (denied) return denied;
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    const { id } = await context.params;
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    const result = await forwardContactMessage(id, message);
    if (result.error) {
      console.error("No se pudo reenviar el mensaje:", result.error);
      return NextResponse.json({ error: "No se pudo reenviar el mensaje. Intenta de nuevo." }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al reenviar mensaje:", error);
    return NextResponse.json({ error: "No se pudo reenviar el mensaje" }, { status: 500 });
  }
}
