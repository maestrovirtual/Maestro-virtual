import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// ==========================================
// GET: Obtener un solo evento por su ID
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const event = await prisma.event.findUnique({
      where: { id: id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Error interno al obtener el evento" },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT: Actualizar un evento
// ==========================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    // Si mandan fecha, hay que parsearla de nuevo
    const dataToUpdate = { ...body };
    if (dataToUpdate.date) {
      dataToUpdate.date = new Date(dataToUpdate.date);
    }

    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Error al actualizar el evento" },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE: Eliminar un evento (Soft Delete)
// ==========================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const deletedEvent = await prisma.event.update({
      where: { id: id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "Evento eliminado correctamente", event: deletedEvent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Error al eliminar el evento" },
      { status: 500 }
    );
  }
}