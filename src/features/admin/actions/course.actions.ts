"use server";

import prisma from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

export async function createCourse(data: any) {
  try {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        image: data.image || "/images/courses/default.jpg",
        color: data.color || "#000000",
        type: data.type,
        stage: data.stage,
        categories: data.categories ? data.categories.split(',').map((c: string) => c.trim()) : [],
        skills: data.skills ? data.skills.split(',').map((s: string) => s.trim()) : [],
        duration: data.duration,
        sessions: data.sessions ? parseInt(data.sessions) : null,
        hoursPerSession: data.hoursPerSession ? parseInt(data.hoursPerSession) : null,
        modality: data.modality,
        participants: data.participants,
        targetAudience: data.targetAudience,
        objective: data.objective,
        requirements: data.requirements,
        backgroundPattern: data.backgroundPattern,
        featured: data.featured === 'on' || data.featured === true,
        isActive: data.isActive === 'on' || data.isActive === true,
        clickable: true,
      }
    });

    revalidatePath("/admin/cursos");
    return { success: true, course };
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, error: "Error al crear el curso. Verifica el slug que sea único." };
  }
}
