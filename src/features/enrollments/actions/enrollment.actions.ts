"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/dal";
import { sendEnrollmentConfirmation } from "@/services/mail/sendEnrollmentConfirmation";

export type EnrollmentItemType = "COURSE" | "EVENT";

export type EnrollActionResult =
  | {
      success: true;
      enrollmentId: string;
      message: string;
    }
  | {
      success: false;
      error: string;
      status?: number;
    };

export async function enrollUserAction(
  itemIdOrFormData: string | FormData,
  typeArg?: EnrollmentItemType,
  currentPathArg?: string
): Promise<EnrollActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("401 Unauthorized");
  }

  const rawItemId =
    itemIdOrFormData instanceof FormData
      ? String(itemIdOrFormData.get("itemId") ?? "")
      : itemIdOrFormData;
  const type = (
    itemIdOrFormData instanceof FormData
      ? String(itemIdOrFormData.get("itemType") ?? "")
      : typeArg
  ) as EnrollmentItemType;
  const currentPath =
    itemIdOrFormData instanceof FormData
      ? String(itemIdOrFormData.get("currentPath") ?? "").trim() || undefined
      : currentPathArg;

  const trimmedId = rawItemId?.trim();
  if (!trimmedId) {
    return {
      success: false,
      error: "El identificador del recurso es obligatorio",
      status: 400,
    };
  }

  if (type !== "COURSE" && type !== "EVENT") {
    return {
      success: false,
      error: "Tipo de inscripción inválido",
      status: 400,
    };
  }

  const relationFilter =
    type === "COURSE" ? { courseId: trimmedId } : { eventId: trimmedId };

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      ...relationFilter,
      status: {
        not: "CANCELLED",
      },
    },
  });

  if (existingEnrollment) {
    return {
      success: false,
      error: "Ya estás inscrito",
      status: 409,
    };
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: user.id,
      status: "REGISTERED",
      ...relationFilter,
    },
    include: {
      course: true,
      event: true,
    },
  });

  // Enviar correo de confirmación automáticamente
  try {
    if (type === "COURSE" && enrollment.course) {
      await sendEnrollmentConfirmation({
        name: user.name,
        email: user.email,
        item: {
          type: "course",
          title: enrollment.course.title,
          duration: enrollment.course.duration,
          modality: enrollment.course.modality,
          participants: enrollment.course.participants,
        },
      });
    } else if (type === "EVENT" && enrollment.event) {
      const date = enrollment.event.date.toISOString().split("T")[0];
      await sendEnrollmentConfirmation({
        name: user.name,
        email: user.email,
        item: {
          type: "event",
          title: enrollment.event.title,
          date,
          time: enrollment.event.time || undefined,
          duration: enrollment.event.duration || undefined,
          modality: enrollment.event.modality === "IN_PERSON" ? "Presencial" : "Online",
          location: enrollment.event.location || undefined,
          address: enrollment.event.address || undefined,
          platform: enrollment.event.platform || undefined,
        },
      });
    }
  } catch (error) {
    console.error("Error enviando correo de confirmación de inscripción:", error);
    // El enrollment ya se creó, así que solo logueamos el error pero no fallamos
  }

  if (currentPath) {
    revalidatePath(currentPath);
  }
  revalidatePath("/", "layout");

  return {
    success: true,
    enrollmentId: enrollment.id,
    message:
      type === "COURSE"
        ? "¡Te has inscrito al curso con éxito!"
        : "¡Te has inscrito al evento con éxito!",
  };
}
