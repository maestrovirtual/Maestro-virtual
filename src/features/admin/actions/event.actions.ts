"use server";

import prisma from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { Modality } from "@prisma/client";
import { requireStaffApi } from "@/lib/auth/dal";
import { uploadEventImage, validateImageFile } from "@/lib/storage";
import type { AdminEvent, EventFormData } from "../types/event.types";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

function resolveModality(value: unknown): Modality {
  const normalized = String(value || "").toUpperCase().trim();
  if (normalized === "PRESENCIAL" || normalized === "IN_PERSON") {
    return Modality.IN_PERSON;
  }
  return Modality.ONLINE;
}

function parseEventInput(input: FormData | Partial<EventFormData>): {
  data: Partial<EventFormData>;
  imageFile: File | null;
  sponsorsImageFile: File | null;
} {
  if (typeof FormData !== "undefined" && input instanceof FormData) {
    const fileEntry = input.get("image");
    const imageFile = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

    const sponsorsEntry = input.get("sponsorsImage") || input.get("sponsorsImageUrl");
    const sponsorsImageFile =
      sponsorsEntry instanceof File && sponsorsEntry.size > 0 ? sponsorsEntry : null;
    const sponsorsImageUrlValue =
      (input.get("sponsorsImageUrl") as string) ||
      (typeof sponsorsEntry === "string" ? sponsorsEntry : undefined);
    const hasSponsorsInput = input.has("sponsorsImage") || input.has("sponsorsImageUrl");

    const data: Partial<EventFormData> = {
      title: (input.get("title") as string) || undefined,
      description: (input.get("description") as string) || undefined,
      date: (input.get("date") as string) || undefined,
      time: (input.get("time") as string) || undefined,
      modality: (input.get("modality") as "ONLINE" | "IN_PERSON") || undefined,
      category: (input.get("category") as string) || undefined,
      image: (input.get("imageUrl") as string) || (typeof fileEntry === "string" ? fileEntry : undefined),
      sponsorsImageUrl: hasSponsorsInput ? sponsorsImageUrlValue || null : undefined,
      platform: (input.get("platform") as string) || null,
      location: (input.get("location") as string) || null,
      address: (input.get("address") as string) || null,
      profile: (input.get("profile") as string) || null,
      objective: (input.get("objective") as string) || null,
      duration: (input.get("duration") as string) || null,
      participants: (input.get("participants") as string) || null,
      requirements: (input.get("requirements") as string) || null,
      isActive: input.has("isActive") ? input.get("isActive") === "true" : true,
    };

    return { data, imageFile, sponsorsImageFile };
  }

  const anyInput = input as Record<string, unknown>;
  let imageFile: File | null = null;
  if (anyInput?.imageFile instanceof File && anyInput.imageFile.size > 0) {
    imageFile = anyInput.imageFile;
  } else if (anyInput?.image instanceof File && anyInput.image.size > 0) {
    imageFile = anyInput.image;
  }

  let sponsorsImageFile: File | null = null;
  if (anyInput?.sponsorsImageFile instanceof File && anyInput.sponsorsImageFile.size > 0) {
    sponsorsImageFile = anyInput.sponsorsImageFile;
  } else if (anyInput?.sponsorsImage instanceof File && anyInput.sponsorsImage.size > 0) {
    sponsorsImageFile = anyInput.sponsorsImage;
  }

  return {
    data: input as Partial<EventFormData>,
    imageFile,
    sponsorsImageFile,
  };
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  try {
    const rawEvents = await prisma.event.findMany({
      orderBy: { date: "desc" },
    });
    return JSON.parse(JSON.stringify(rawEvents)) as AdminEvent[];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al obtener eventos";
    throw new Error(message);
  }
}

export async function createEventAction(
  input: FormData | Partial<EventFormData>
): Promise<ActionResult<AdminEvent>> {
  try {
    const denied = await requireStaffApi();
    if (denied) {
      return {
        success: false,
        error: "No autorizado. Se requieren permisos de administrador (staff).",
      };
    }

    const { data, imageFile, sponsorsImageFile } = parseEventInput(input);

    if (!data.title?.trim()) {
      return {
        success: false,
        error: "El título del evento es obligatorio.",
      };
    }

    if (!data.date) {
      return {
        success: false,
        error: "La fecha del evento es obligatoria.",
      };
    }

    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      return {
        success: false,
        error: "La fecha ingresada no es válida.",
      };
    }

    // Procesar y subir imagen si se adjuntó un archivo
    let finalImageUrl = data.image?.trim() || "/images/events/default.jpg";
    if (imageFile) {
      const validation = validateImageFile(imageFile);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "El archivo de imagen no es válido.",
        };
      }

      try {
        const uploadResult = await uploadEventImage(imageFile);
        finalImageUrl = uploadResult.url;
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Error al subir la imagen al servicio de Storage.";
        return { success: false, error: message };
      }
    }

    // Procesar y subir imagen de patrocinadores si se adjuntó un archivo
    let finalSponsorsImageUrl: string | null = data.sponsorsImageUrl?.trim() || null;
    if (sponsorsImageFile) {
      const validation = validateImageFile(sponsorsImageFile);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "El archivo de imagen de patrocinadores no es válido.",
        };
      }

      try {
        const uploadResult = await uploadEventImage(sponsorsImageFile);
        finalSponsorsImageUrl = uploadResult.url;
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Error al subir la imagen de patrocinadores al servicio de Storage.";
        return { success: false, error: message };
      }
    }

    const modalityValue = resolveModality(data.modality);

    const event = await prisma.event.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || "Descripción pendiente",
        image: finalImageUrl,
        sponsorsImageUrl: finalSponsorsImageUrl,
        date: parsedDate,
        time: data.time ? data.time.trim() : "Por definir",
        modality: modalityValue,
        category: data.category ? data.category.trim() : "general",
        profile: data.profile ? data.profile.trim() : null,
        objective: data.objective ? data.objective.trim() : null,
        duration: data.duration ? data.duration.trim() : null,
        participants: data.participants ? data.participants.trim() : null,
        requirements: data.requirements ? data.requirements.trim() : null,
        location: data.location ? data.location.trim() : null,
        address: data.address ? data.address.trim() : null,
        platform: data.platform ? data.platform.trim() : null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });

    revalidatePath("/admin/eventos");
    revalidatePath("/admin/events");
    revalidatePath("/eventos");
    revalidatePath("/events");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(event)) as AdminEvent,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear el evento. Revisa los datos ingresados.";
    return { success: false, error: message };
  }
}

export async function updateEventAction(
  id: string,
  input: FormData | Partial<EventFormData>
): Promise<ActionResult<AdminEvent>> {
  try {
    const denied = await requireStaffApi();
    if (denied) {
      return {
        success: false,
        error: "No autorizado. Se requieren permisos de administrador (staff).",
      };
    }

    if (!id) {
      return { success: false, error: "ID del evento no proporcionado." };
    }

    const { data, imageFile, sponsorsImageFile } = parseEventInput(input);

    if (data.title !== undefined && !data.title.trim()) {
      return { success: false, error: "El título no puede estar vacío." };
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
        const uploadResult = await uploadEventImage(imageFile);
        updatePayload.image = uploadResult.url;
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Error al subir la imagen al servicio de Storage.";
        return { success: false, error: message };
      }
    } else if (data.image !== undefined) {
      updatePayload.image = data.image.trim();
    }

    // Procesar nueva imagen de patrocinadores si se adjuntó archivo
    if (sponsorsImageFile) {
      const validation = validateImageFile(sponsorsImageFile);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "El archivo de imagen de patrocinadores no es válido.",
        };
      }

      try {
        const uploadResult = await uploadEventImage(sponsorsImageFile);
        updatePayload.sponsorsImageUrl = uploadResult.url;
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Error al subir la imagen de patrocinadores al servicio de Storage.";
        return { success: false, error: message };
      }
    } else if (data.sponsorsImageUrl !== undefined) {
      updatePayload.sponsorsImageUrl = data.sponsorsImageUrl ? data.sponsorsImageUrl.trim() : null;
    }

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined) updatePayload.description = data.description.trim();

    if (data.date !== undefined) {
      const parsedDate = new Date(data.date);
      if (isNaN(parsedDate.getTime())) {
        return { success: false, error: "La fecha ingresada no es válida." };
      }
      updatePayload.date = parsedDate;
    }

    if (data.time !== undefined) updatePayload.time = data.time ? data.time.trim() : null;
    if (data.modality !== undefined) updatePayload.modality = resolveModality(data.modality);
    if (data.category !== undefined) updatePayload.category = data.category ? data.category.trim() : "general";
    if (data.profile !== undefined) updatePayload.profile = data.profile ? data.profile.trim() : null;
    if (data.objective !== undefined) updatePayload.objective = data.objective ? data.objective.trim() : null;
    if (data.duration !== undefined) updatePayload.duration = data.duration ? data.duration.trim() : null;
    if (data.participants !== undefined) updatePayload.participants = data.participants ? data.participants.trim() : null;
    if (data.requirements !== undefined) updatePayload.requirements = data.requirements ? data.requirements.trim() : null;
    if (data.location !== undefined) updatePayload.location = data.location ? data.location.trim() : null;
    if (data.address !== undefined) updatePayload.address = data.address ? data.address.trim() : null;
    if (data.platform !== undefined) updatePayload.platform = data.platform ? data.platform.trim() : null;
    if (data.isActive !== undefined) updatePayload.isActive = Boolean(data.isActive);

    const updated = await prisma.event.update({
      where: { id },
      data: updatePayload,
    });

    revalidatePath("/admin/eventos");
    revalidatePath("/admin/events");
    revalidatePath("/eventos");
    revalidatePath("/events");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updated)) as AdminEvent,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar el evento.";
    return { success: false, error: message };
  }
}

export async function deleteEventAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const denied = await requireStaffApi();
    if (denied) {
      return {
        success: false,
        error: "No autorizado. Se requieren permisos de administrador (staff).",
      };
    }

    if (!id) {
      return { success: false, error: "ID del evento no proporcionado." };
    }

    if (typeof prisma.event.delete === "function") {
      await prisma.event.delete({
        where: { id },
      });
    } else {
      await prisma.event.update({
        where: { id },
        data: { isActive: false },
      });
    }

    revalidatePath("/admin/eventos");
    revalidatePath("/admin/events");
    revalidatePath("/eventos");
    revalidatePath("/events");

    return { success: true, data: { id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar el evento.";
    return { success: false, error: message };
  }
}
