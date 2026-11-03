/**
 * @jest-environment node
 */

import { enrollUserAction } from "@/features/enrollments/actions/enrollment.actions";
import prisma from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/dal";
import { sendEnrollmentConfirmation } from "@/services/mail/sendEnrollmentConfirmation";
import { revalidatePath } from "next/cache";

jest.mock("@/lib/auth/dal", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/prisma/client", () => ({
  __esModule: true,
  default: {
    enrollment: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/services/mail/sendEnrollmentConfirmation", () => ({
  sendEnrollmentConfirmation: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("enrollUserAction", () => {
  const mockUser = {
    id: "user-123",
    name: "Juan Pérez",
    email: "juan@example.com",
    role: "USER" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });

  it("captura errores de base de datos en prisma.enrollment.create y retorna estado seguro", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (prisma.enrollment.findFirst as jest.Mock).mockResolvedValue(null);
    const dbError = new Error("DB Connection timed out");
    (prisma.enrollment.create as jest.Mock).mockRejectedValue(dbError);

    const result = await enrollUserAction("course-1", "COURSE");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error al guardar inscripción:",
      dbError
    );
    expect(result).toEqual({
      success: false,
      error:
        "No se pudo procesar tu inscripción en este momento. Por favor, verifica los datos e intenta de nuevo.",
    });

    consoleErrorSpy.mockRestore();
  });

  it("completa la inscripción exitosamente cuando la base de datos responde", async () => {
    (prisma.enrollment.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.enrollment.create as jest.Mock).mockResolvedValue({
      id: "enroll-1",
      userId: "user-123",
      courseId: "course-1",
      course: {
        title: "Curso Next.js",
        duration: "10 horas",
        modality: "ONLINE",
        participants: 20,
      },
    });

    const result = await enrollUserAction("course-1", "COURSE");

    expect(result).toEqual({
      success: true,
      enrollmentId: "enroll-1",
      message: "¡Te has inscrito al curso con éxito!",
    });
    expect(sendEnrollmentConfirmation).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

