import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockFindMany = jest.fn();

jest.mock("@/lib/prisma/client", () => ({
  __esModule: true,
  default: {
    enrollment: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

import AdminEnrollmentsTable from "@/features/admin/components/AdminEnrollmentsTable";

describe("AdminEnrollmentsTable (MV-37)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra 'No hay inscripciones aún' cuando no existen registros", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const ui = await AdminEnrollmentsTable({ courseId: "course-123" });
    render(ui);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { courseId: "course-123" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    expect(screen.getByText("No hay inscripciones aún")).toBeInTheDocument();
  });

  it("renderiza la tabla con Nombre, Correo, Fecha de inscripción y Estado para un curso", async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        id: "enr-1",
        status: "REGISTERED",
        date: new Date("2026-10-29T12:00:00.000Z"),
        userId: "user-1",
        courseId: "course-123",
        eventId: null,
        user: {
          name: "María González",
          email: "maria@ejemplo.com",
        },
      },
    ]);

    const ui = await AdminEnrollmentsTable({ courseId: "course-123" });
    render(ui);

    expect(screen.getByText("María González")).toBeInTheDocument();
    expect(screen.getByText("maria@ejemplo.com")).toBeInTheDocument();
    expect(screen.getByText("Registrado")).toBeInTheDocument();
    expect(screen.getByText("1 inscrito")).toBeInTheDocument();
  });

  it("filtra por eventId cuando se consulta la vista de un evento", async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        id: "enr-2",
        status: "COMPLETED",
        date: new Date("2026-10-30T15:00:00.000Z"),
        userId: "user-2",
        courseId: null,
        eventId: "event-456",
        user: {
          name: "Carlos Ramírez",
          email: "carlos@ejemplo.com",
        },
      },
    ]);

    const ui = await AdminEnrollmentsTable({ eventId: "event-456" });
    render(ui);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: "event-456" },
      })
    );
    expect(screen.getByText("Carlos Ramírez")).toBeInTheDocument();
    expect(screen.getByText("carlos@ejemplo.com")).toBeInTheDocument();
    expect(screen.getByText("Completado")).toBeInTheDocument();
  });
});

