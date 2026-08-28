import { NextResponse } from "next/server";
// Importamos el cliente de Prisma usando la ruta que vimos en tu foto
import prisma from "@/lib/prisma/client";

// ==========================================
// GET: Obtener todos los cursos activos
// ==========================================
export async function GET() {
  try {
    // Solo buscamos los cursos que tengan isActive en true
    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
      },
      // Podemos decirle a Prisma que traiga de una vez los testimonios
      include: {
        testimonials: true,
      },
    });

    // Criterio de aceptación: Retornar código 200 (OK)
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

    // Criterio de aceptación: Validación básica de datos de entrada
    // Revisamos que al menos manden el título y el slug (que son obligatorios en tu base de datos)
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: "El título y el slug son obligatorios para crear un curso" },
        { status: 400 } // 400 Bad Request
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description || "Descripción pendiente",
        image: body.image || "https://placeholder.com/image.jpg",
        categories: body.categories || [],
        skills: body.skills || [],
        duration: body.duration || "Por definir",
        backgroundPattern: body.backgroundPattern || "default-pattern",
        stage: body.stage || "borrador",
      },
    });

    // Criterio de aceptación: Retornar código 201 (Created)
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear el curso" },
      { status: 500 }
    );
  }
}