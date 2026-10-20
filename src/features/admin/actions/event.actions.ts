"use server";

import prisma from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { Modality } from "@prisma/client";
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
  data: Partial<EventFormData>
): Promise<ActionResult<AdminEvent>> {
  try {
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

    const modalityValue = resolveModality(data.modality);

    const event = await prisma.event.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || "Descripción pendiente",
        image: data.image?.trim() || "/images/events/default.jpg",
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
  data: Partial<EventFormData>
): Promise<ActionResult<AdminEvent>> {
  try {
    if (!id) {
      return { success: false, error: "ID del evento no proporcionado." };
    }

    if (data.title !== undefined && !data.title.trim()) {
      return { success: false, error: "El título no puede estar vacío." };
    }

    const updatePayload: Record<string, unknown> = {};

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined) updatePayload.description = data.description.trim();
    if (data.image !== undefined) updatePayload.image = data.image.trim();

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
