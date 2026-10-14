import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireStaffApi } from "@/lib/auth/dal";

export async function GET(request: Request) {
  try {
    const denied = await requireStaffApi();
    if (denied) return denied;
    const rawPage = new URL(request.url).searchParams.get("page") ?? "1";
    const page = Number(rawPage);
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
      return NextResponse.json({ error: "Página inválida" }, { status: 400 });
    }
    const pageSize = 20;
    const [messages, total] = await prisma.$transaction([
      prisma.contactMessage.findMany({
        orderBy: [{ date: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactMessage.count(),
    ]);
    return NextResponse.json({ messages, total, page, pageSize }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return NextResponse.json({ error: "No se pudieron cargar los mensajes" }, { status: 500 });
  }
}
