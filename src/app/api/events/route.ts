import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireStaffApi } from "@/lib/auth/dal";

// ==========================================
// GET: Obtener todos los eventos activos o todos si ?all=true
// ==========================================
export async function GET(request?: Request) {
  try {
    let includeAll = false;
    if (request && request.url) {
      try {
        const { searchParams } = new URL(request.url);
        includeAll = searchParams.get("all") === "true";
      } catch {
        // ignore
      }
    }

    const events = await prisma.event.findMany({
      where: includeAll
        ? undefined
        : {
            isActive: true,
          },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Error interno al obtener los eventos" },
      { status: 500 }
    );
  }
}

// ==========================================
// POST: Crear un nuevo evento
// ==========================================
export async function POST(request: Request) {
  try {
    const denied = await requireStaffApi();
    if (denied) return denied;

    const body = await request.json();

    // Criterio de aceptación: Validación básica
    if (!body.title || !body.date || !body.modality) {
      return NextResponse.json(
        { error: "El título, la fecha y la modalidad son obligatorios" },
        { status: 400 }
      );
    }

    const isPresencial =
      body.modality === "presencial" ||
      body.modality === "IN_PERSON" ||
      String(body.modality).toLowerCase() === "in_person";

    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        category: body.category || "general",
        profile: body.profile || "Por definir",
        objective: body.objective || "Descripción pendiente",
        duration: body.duration || "Por definir",
        participants: body.participants || "Por definir",
        date: new Date(body.date),
        time: body.time || "Por definir",
        modality: isPresencial ? "IN_PERSON" : "ONLINE",
        location: body.location || null,
        address: body.address || null,
        platform: body.platform || null,
        requirements: body.requirements || null,
        description: body.description || "Descripción pendiente",
        image: body.image || "",
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Error interno al crear el evento" },
      { status: 500 }
    );
  }
}