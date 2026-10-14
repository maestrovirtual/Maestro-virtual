import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireStaffApi } from "@/lib/auth/dal";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireStaffApi();
    if (denied) return denied;
    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || !("isRead" in body) || typeof body.isRead !== "boolean") {
      return NextResponse.json({ error: "isRead debe ser un booleano" }, { status: 400 });
    }
    const { id } = await context.params;
    const result = await prisma.contactMessage.updateMany({ where: { id }, data: { isRead: body.isRead } });
    if (!result.count) return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    return NextResponse.json({ id, isRead: body.isRead });
  } catch (error) {
    console.error("Error al actualizar mensaje:", error);
    return NextResponse.json({ error: "No se pudo actualizar el mensaje" }, { status: 500 });
  }
}
