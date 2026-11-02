import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireStaffApi } from "@/lib/auth/dal";

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
    const denied = await requireStaffApi();
    if (denied) return denied;

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    const dataToUpdate: Record<string, unknown> = { ...body };

    if (dataToUpdate.date) {
      dataToUpdate.date = new Date(dataToUpdate.date as string);
    }

    if (dataToUpdate.modality) {
      const isPresencial =
        dataToUpdate.modality === "presencial" ||
        dataToUpdate.modality === "IN_PERSON" ||
        String(dataToUpdate.modality).toLowerCase() === "in_person";
      dataToUpdate.modality = isPresencial ? "IN_PERSON" : "ONLINE";
    }

    if (dataToUpdate.isActive !== undefined) {
      dataToUpdate.isActive = Boolean(dataToUpdate.isActive);
    }

    delete dataToUpdate.id;
    delete dataToUpdate.createdAt;
    delete dataToUpdate.updatedAt;
    delete dataToUpdate.enrollments;

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
// DELETE: Eliminar un evento (Eliminación física)
// ==========================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireStaffApi();
    if (denied) return denied;

    const resolvedParams = await params;
    const id = resolvedParams.id;

    let deletedEvent;
    if (typeof prisma.event.delete === "function") {
      deletedEvent = await prisma.event.delete({
        where: { id: id },
      });
    } else {
      deletedEvent = await prisma.event.update({
        where: { id: id },
        data: { isActive: false },
      });
    }

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