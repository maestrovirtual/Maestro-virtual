import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { Stage, CourseType, BackgroundPattern } from "@prisma/client";
import { stageMap, typeMap, patternMap, resolveEnum } from "@/lib/prisma/course-enums";

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
    shortDescription: body.shortDescription || "",
    description: body.description || "Descripción pendiente",
    image: body.image || "https://placeholder.com/image.jpg",
    icon: body.icon || null,
    video: body.video || null,
    color: body.color || "#334155",
    type: resolveEnum(body.type, typeMap, Object.values(CourseType), CourseType.CURSO),
    stage: resolveEnum(String(body.stage ?? "1"), stageMap, Object.values(Stage), Stage.UNO),
    categories: body.categories || [],
    skills: body.skills || [],
    duration: body.duration || "Por definir",
    sessions: body.sessions != null ? Number(body.sessions) : null,
    hoursPerSession:
      body.hoursPerSession != null ? Number(body.hoursPerSession) : null,
    modality: body.modality || "Por definir",
    participants: body.participants || "Por definir",
    targetAudience: body.targetAudience || "",
    objective: body.objective || "",
    requirements: body.requirements || "",
    backgroundPattern: resolveEnum(
      body.backgroundPattern,
      patternMap,
      Object.values(BackgroundPattern),
      BackgroundPattern.GRID
    ),
    featured: body.featured ?? false,
    featuredOrder: body.featuredOrder != null ? Number(body.featuredOrder) : null,
    clickable: body.clickable ?? true,
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