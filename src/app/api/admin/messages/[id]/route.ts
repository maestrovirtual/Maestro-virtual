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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
    }
    const data: { isRead?: boolean; isArchived?: boolean; isSpam?: boolean } = {};
    for (const [key, value] of Object.entries(body)) {
      if ((key !== "isRead" && key !== "isArchived" && key !== "isSpam") || typeof value !== "boolean") {
        return NextResponse.json({ error: "Solo se permiten isRead, isArchived e isSpam como booleanos" }, { status: 400 });
      }
      data[key] = value;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Indica el estado que deseas actualizar" }, { status: 400 });
    }
    if (data.isArchived === true && data.isSpam === true) {
      return NextResponse.json({ error: "El mensaje solo puede estar en una carpeta" }, { status: 400 });
    }
    if (data.isSpam === true) data.isArchived = false;
    if (data.isArchived === true) data.isSpam = false;
    const { id } = await context.params;
    const result = await prisma.contactMessage.updateMany({ where: { id }, data });
    if (!result.count) return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Error al actualizar mensaje:", error);
    return NextResponse.json({ error: "No se pudo actualizar el mensaje" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireStaffApi();
    if (denied) return denied;
    const { id } = await context.params;
    const result = await prisma.contactMessage.deleteMany({ where: { id } });
    if (!result.count) return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error("Error al eliminar mensaje:", error);
    return NextResponse.json({ error: "No se pudo eliminar el mensaje" }, { status: 500 });
  }
}
