import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// ==========================================
// GET: Obtener todos los cursos activos
// ==========================================
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
      },
      include: {
        testimonials: true,
      },
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener los cursos" },
      { status: 500 }
    );
  }
}

// ==========================================
// POST: Crear un nuevo curso
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: "El título y el slug son obligatorios para crear un curso" },
        { status: 400 }
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description || "Descripción pendiente",
        stage: body.stage ?? 1, // Int: 1, 2 o 3 según tu schema
        categories: body.categories || [],
        type: body.type || "Curso", // "Curso" | "Taller" | "Conferencia"
        backgroundPattern: body.backgroundPattern || "grid",
        duration: body.duration || "Por definir",
        modality: body.modality || "online",
        participants: body.participants || "Por definir",
        targetAudience: body.targetAudience || "Por definir",
        objective: body.objective || "Por definir",
        requirements: body.requirements || "Ninguno",
        skills: body.skills || [],  
        image: body.image || "https://placeholder.com/image.jpg",
        color: body.color || "#000000",
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear el curso" },
      { status: 500 }
    );
  }
}