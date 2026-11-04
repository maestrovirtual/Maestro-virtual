"use server";

import prisma from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { Stage, CourseType, BackgroundPattern } from "@prisma/client";
import { stageMap, typeMap, patternMap, resolveEnum } from "@/lib/prisma/course-enums";
import { requireStaffApi } from "@/lib/auth/dal";
import { uploadCourseImage, validateImageFile } from "@/lib/storage";
import type { AdminCourse, CourseFormData } from "../types/course.types";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

function parseCourseInput(input: FormData | Partial<CourseFormData>): {
  data: Partial<CourseFormData>;
  imageFile: File | null;
} {
  if (typeof FormData !== "undefined" && input instanceof FormData) {
    const fileEntry = input.get("image");
    const imageFile = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

    const data: Partial<CourseFormData> = {
      title: (input.get("title") as string) || undefined,
      slug: (input.get("slug") as string) || undefined,
      shortDescription: (input.get("shortDescription") as string) || undefined,
      description: (input.get("description") as string) || undefined,
      duration: (input.get("duration") as string) || undefined,
      modality: (input.get("modality") as string) || undefined,
      type: (input.get("type") as string) || undefined,
      stage: (input.get("stage") as string) || undefined,
      categories: input.get("categories")
        ? (input.get("categories") as string)
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : undefined,
      skills: input.get("skills")
        ? (input.get("skills") as string)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      image: (input.get("imageUrl") as string) || (typeof fileEntry === "string" ? fileEntry : undefined),
      color: (input.get("color") as string) || undefined,
      backgroundPattern: (input.get("backgroundPattern") as string) || undefined,
      sessions: input.get("sessions") ? Number(input.get("sessions")) : null,
      hoursPerSession: input.get("hoursPerSession") ? Number(input.get("hoursPerSession")) : null,
      participants: (input.get("participants") as string) || undefined,
      targetAudience: (input.get("targetAudience") as string) || undefined,
      objective: (input.get("objective") as string) || undefined,
      requirements: (input.get("requirements") as string) || undefined,
      isActive: input.has("isActive") ? input.get("isActive") === "true" : true,
      featured: input.has("featured") ? input.get("featured") === "true" : false,
      clickable: true,
    };

    return { data, imageFile };
  }

  const anyInput = input as Record<string, unknown>;
  let imageFile: File | null = null;
  if (anyInput?.imageFile instanceof File && anyInput.imageFile.size > 0) {
    imageFile = anyInput.imageFile;
  } else if (anyInput?.image instanceof File && anyInput.image.size > 0) {
    imageFile = anyInput.image;
  }

  return {
    data: input as Partial<CourseFormData>,
    imageFile,
  };
}

export async function getAdminCourses(): Promise<AdminCourse[]> {
  try {
    const rawCourses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    });
    return JSON.parse(JSON.stringify(rawCourses)) as AdminCourse[];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al obtener cursos";
    throw new Error(message);
  }
}

export async function createCourseAction(
  input: FormData | Partial<CourseFormData>
): Promise<ActionResult<AdminCourse>> {
  try {
    const denied = await requireStaffApi();
    if (denied) {
      return {
        success: false,
        error: "No autorizado. Se requieren permisos de administrador (staff).",
      };
    }

    const { data, imageFile } = parseCourseInput(input);

    if (!data.title?.trim() || !data.slug?.trim()) {
      return {
        success: false,
        error: "El título y el slug son obligatorios.",
      };
    }

    if (!data.description?.trim()) {
      return {
        success: false,
        error: "La descripción completa es obligatoria.",
      };
    }

    // Procesar y subir imagen si se adjuntó un archivo
    let finalImageUrl = data.image?.trim() || "/images/courses/default.jpg";
    if (imageFile) {
      const validation = validateImageFile(imageFile);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "El archivo de imagen no es válido.",
        };
      }

      try {
        const uploadResult = await uploadCourseImage(imageFile);
        finalImageUrl = uploadResult.url;
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Error al subir la imagen del curso al almacenamiento.";
        return { success: false, error: message };
      }
    }

    const stageValue = resolveEnum(
      String(data.stage ?? "1"),
      stageMap,
      Object.values(Stage),
      Stage.UNO
    );
    const typeValue = resolveEnum(
      String(data.type ?? "CURSO"),
      typeMap,
      Object.values(CourseType),
      CourseType.CURSO
    );
    const patternValue = resolveEnum(
      String(data.backgroundPattern ?? "GRID"),
      patternMap,
      Object.values(BackgroundPattern),
      BackgroundPattern.GRID
    );

    const categoriesArray = Array.isArray(data.categories)
      ? data.categories
      : typeof data.categories === "string"
      ? (data.categories as string)
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    const skillsArray = Array.isArray(data.skills)
      ? data.skills
      : typeof data.skills === "string"
      ? (data.skills as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const course = await prisma.course.create({
      data: {
        title: data.title.trim(),
        slug: data.slug.trim(),
        shortDescription: data.shortDescription?.trim() || "",
        description: data.description.trim(),
        image: finalImageUrl,
        icon: data.icon || null,
        video: data.video || null,
        color: data.color?.trim() || "#2563EB",
        type: typeValue,
        stage: stageValue,
        categories: categoriesArray,
        skills: skillsArray,
        duration: data.duration?.trim() || "Por definir",
        sessions: data.sessions != null && !isNaN(Number(data.sessions)) ? Number(data.sessions) : null,
        hoursPerSession:
          data.hoursPerSession != null && !isNaN(Number(data.hoursPerSession))
            ? Number(data.hoursPerSession)
            : null,
        modality: data.modality?.trim() || "Presencial",
        participants: data.participants?.trim() || "10 - 15 participantes",
        targetAudience: data.targetAudience?.trim() || "Público en general",
        objective: data.objective?.trim() || "",
        requirements: data.requirements?.trim() || "Ninguno",
        backgroundPattern: patternValue,
        featured: Boolean(data.featured),
        featuredOrder:
          data.featuredOrder != null && !isNaN(Number(data.featuredOrder))
            ? Number(data.featuredOrder)
            : null,
        clickable: data.clickable ?? true,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });

    revalidatePath("/admin/cursos");
    revalidatePath("/admin/courses");
    revalidatePath("/cursos");
    revalidatePath("/courses");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(course)) as AdminCourse,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Ya existe un curso con este slug. Por favor escribe uno diferente."
        : "Error al crear el curso. Revisa los datos ingresados.";
    return { success: false, error: errorMsg };
  }
}

export async function updateCourseAction(
  id: string,
  input: FormData | Partial<CourseFormData>
): Promise<ActionResult<AdminCourse>> {
  try {
    const denied = await requireStaffApi();
    if (denied) {
      return {
        success: false,
        error: "No autorizado. Se requieren permisos de administrador (staff).",
      };
    }

    if (!id) {
      return { success: false, error: "ID del curso no proporcionado." };
    }

    const { data, imageFile } = parseCourseInput(input);

    if (data.title !== undefined && !data.title.trim()) {
      return { success: false, error: "El título no puede estar vacío." };
    }

    if (data.description !== undefined && !data.description.trim()) {
      return { success: false, error: "La descripción no puede estar vacía." };
    }

    const updatePayload: Record<string, unknown> = {};

    // Procesar nueva imagen si se adjuntó archivo
    if (imageFile) {
      const validation = validateImageFile(imageFile);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "El archivo de imagen no es válido.",
        };
      }

      try {
        const uploadResult = await uploadCourseImage(imageFile);
        updatePayload.image = uploadResult.url;
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Error al subir la nueva imagen del curso al almacenamiento.";
        return { success: false, error: message };
      }
    } else if (data.image !== undefined) {
      updatePayload.image = data.image.trim();
    }

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.slug !== undefined) updatePayload.slug = data.slug.trim();
    if (data.shortDescription !== undefined)
      updatePayload.shortDescription = data.shortDescription.trim();
    if (data.description !== undefined)
      updatePayload.description = data.description.trim();
    if (data.icon !== undefined) updatePayload.icon = data.icon;
    if (data.video !== undefined) updatePayload.video = data.video;
    if (data.color !== undefined) updatePayload.color = data.color.trim();

    if (data.type !== undefined) {
      updatePayload.type = resolveEnum(
        String(data.type),
        typeMap,
        Object.values(CourseType),
        CourseType.CURSO
      );
    }
    if (data.stage !== undefined) {
      updatePayload.stage = resolveEnum(
        String(data.stage),
        stageMap,
        Object.values(Stage),
        Stage.UNO
      );
    }
    if (data.backgroundPattern !== undefined) {
      updatePayload.backgroundPattern = resolveEnum(
        String(data.backgroundPattern),
        patternMap,
        Object.values(BackgroundPattern),
        BackgroundPattern.GRID
      );
    }

    if (data.categories !== undefined) {
      updatePayload.categories = Array.isArray(data.categories)
        ? data.categories
        : typeof data.categories === "string"
        ? (data.categories as string)
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : [];
    }

    if (data.skills !== undefined) {
      updatePayload.skills = Array.isArray(data.skills)
        ? data.skills
        : typeof data.skills === "string"
        ? (data.skills as string)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    }

    if (data.duration !== undefined) updatePayload.duration = data.duration.trim();
    if (data.sessions !== undefined) {
      updatePayload.sessions =
        data.sessions != null && !isNaN(Number(data.sessions))
          ? Number(data.sessions)
          : null;
    }
    if (data.hoursPerSession !== undefined) {
      updatePayload.hoursPerSession =
        data.hoursPerSession != null && !isNaN(Number(data.hoursPerSession))
          ? Number(data.hoursPerSession)
          : null;
    }
    if (data.modality !== undefined) updatePayload.modality = data.modality.trim();
    if (data.participants !== undefined)
      updatePayload.participants = data.participants.trim();
    if (data.targetAudience !== undefined)
      updatePayload.targetAudience = data.targetAudience.trim();
    if (data.objective !== undefined)
      updatePayload.objective = data.objective.trim();
    if (data.requirements !== undefined)
      updatePayload.requirements = data.requirements.trim();
    if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
    if (data.featuredOrder !== undefined) {
      updatePayload.featuredOrder =
        data.featuredOrder != null && !isNaN(Number(data.featuredOrder))
          ? Number(data.featuredOrder)
          : null;
    }
    if (data.clickable !== undefined) updatePayload.clickable = Boolean(data.clickable);
    if (data.isActive !== undefined) updatePayload.isActive = Boolean(data.isActive);

    const updated = await prisma.course.update({
      where: { id },
      data: updatePayload,
    });

    revalidatePath("/admin/cursos");
    revalidatePath("/admin/courses");
    revalidatePath("/cursos");
    revalidatePath("/courses");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updated)) as AdminCourse,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Ya existe otro curso con este slug. Por favor escribe uno diferente."
        : "Error al actualizar el curso.";
    return { success: false, error: errorMsg };
  }
}

export async function deleteCourseAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const denied = await requireStaffApi();
    if (denied) {
      return {
        success: false,
        error: "No autorizado. Se requieren permisos de administrador (staff).",
      };
    }

    if (!id) {
      return { success: false, error: "ID del curso no proporcionado." };
    }

    if (typeof prisma.course.delete === "function") {
      await prisma.course.delete({
        where: { id },
      });
    } else {
      await prisma.course.update({
        where: { id },
        data: { isActive: false },
      });
    }

    revalidatePath("/admin/cursos");
    revalidatePath("/admin/courses");
    revalidatePath("/cursos");
    revalidatePath("/courses");

    return { success: true, data: { id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar el curso.";
    return { success: false, error: message };
  }
}
