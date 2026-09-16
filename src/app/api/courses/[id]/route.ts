import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { Stage, CourseType, BackgroundPattern } from "@prisma/client";
import { stageMap, typeMap, patternMap, resolveEnum } from "@/lib/prisma/course-enums";

// ==========================================
// GET: Obtener un solo curso por su SLUG
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // <-- Cambio en el tipo
) {
  try {
    // <-- AQUÍ ESTÁ LA MAGIA: Esperamos a que los parámetros estén listos
    const resolvedParams = await params;
    const identifier = resolvedParams.id;

    const course = await prisma.course.findUnique({
      where: {
        slug: identifier,
      },
      include: {
        testimonials: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Error interno al obtener el curso" },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT: Actualizar un curso por su ID
// ==========================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // <-- Cambio en el tipo
) {
  try {
    const resolvedParams = await params; // <-- Esperamos los parámetros
    const id = resolvedParams.id;
    const body = await request.json();

    // Igual que en el POST: si mandan valores "bonitos" (stage: 1,
    // type: "Curso", backgroundPattern: "waves") los traducimos al enum.
    // Si no vienen en el body, se dejan fuera del update (no se tocan).
    const data: Record<string, unknown> = { ...body };
    if (body.stage !== undefined) {
      data.stage = resolveEnum(String(body.stage), stageMap, Object.values(Stage), Stage.UNO);
    }
    if (body.type !== undefined) {
      data.type = resolveEnum(body.type, typeMap, Object.values(CourseType), CourseType.CURSO);
    }
    if (body.backgroundPattern !== undefined) {
      data.backgroundPattern = resolveEnum(
        body.backgroundPattern,
        patternMap,
        Object.values(BackgroundPattern),
        BackgroundPattern.GRID
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id: id },
      data,
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Error al actualizar el curso" },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE: Eliminar un curso (Soft Delete)
// ==========================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // <-- Cambio en el tipo
) {
  try {
    const resolvedParams = await params; // <-- Esperamos los parámetros
    const id = resolvedParams.id;

    const deletedCourse = await prisma.course.update({
      where: { id: id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "Curso eliminado correctamente", course: deletedCourse },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Error al eliminar el curso" },
      { status: 500 }
    );
  }
}