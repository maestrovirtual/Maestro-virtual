"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/dal";

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
  itemId: string,
  type: EnrollmentItemType,
  currentPath?: string
): Promise<EnrollActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("401 Unauthorized");
  }

  const trimmedId = itemId?.trim();
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
  });

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
