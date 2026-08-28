import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// ==========================================
// GET: Obtener todos los eventos activos
// ==========================================
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
      },
      // Ordenamos por fecha para que los más próximos salgan primero
      orderBy: {
        date: 'asc'
      }
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
    const body = await request.json();

    // Criterio de aceptación: Validación básica
    if (!body.title || !body.date || !body.modality) {
      return NextResponse.json(
        { error: "El título, la fecha y la modalidad son obligatorios" },
        { status: 400 }
      );
    }

    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description || "Descripción pendiente",
        image: body.image || "https://placeholder.com/event.jpg",
        date: new Date(body.date), // Convertimos el string a formato Fecha
        modality: body.modality, // 'IN_PERSON' o 'ONLINE'
        location: body.location || null,
        address: body.address || null,
        platform: body.platform || null,
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