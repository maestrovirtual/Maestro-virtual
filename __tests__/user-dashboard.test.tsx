import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockRedirect = jest.fn();
const mockUseParams = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockFindMany = jest.fn();
const mockLogoutAction = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  useParams: () => mockUseParams(),
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("@/lib/auth/dal", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

jest.mock("@/lib/prisma/client", () => ({
  __esModule: true,
  default: {
    enrollment: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

jest.mock("@/features/account/actions/account.actions", () => ({
  logoutAction: (...args: unknown[]) => mockLogoutAction(...args),
}));

import Navbar from "@/components/layout/Navbar";
import UserDashboardPage from "@/app/[locale]/(private)/dashboard/page";

describe("MV-39: Dashboard de usuario y menú de perfil en Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ locale: "es" });
  });

  describe("Navbar", () => {
    it("muestra 'Iniciar sesión' cuando no hay sesión activa", () => {
      render(<Navbar session={null} />);

      expect(
        screen.getByRole("link", { name: /iniciar sesión/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /menú de perfil/i })
      ).not.toBeInTheDocument();
    });

    it("reemplaza el botón estático por el Dropdown de perfil con 'Mi Dashboard' y 'Cerrar Sesión'", () => {
      render(
        <Navbar
          session={{
            id: "user-1",
            name: "María González",
            email: "maria@ejemplo.com",
          }}
        />
      );

      expect(screen.queryByText(/próximamente/i)).not.toBeInTheDocument();

      const profileButton = screen.getByRole("button", {
        name: /menú de perfil/i,
      });
      expect(profileButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(profileButton);
      expect(profileButton).toHaveAttribute("aria-expanded", "true");

      const dashboardLink = screen.getByRole("menuitem", {
        name: /mi dashboard/i,
      });
      expect(dashboardLink).toHaveAttribute("href", "/es/dashboard");

      const logoutButton = screen.getByRole("menuitem", {
        name: /cerrar sesión/i,
      });
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton.closest("form")).toBeInTheDocument();
    });
  });

  describe("UserDashboardPage", () => {
    it("redirige a /${locale}/login si no existe sesión activa", async () => {
      mockGetCurrentUser.mockResolvedValueOnce(null);

      await expect(
        UserDashboardPage({ params: Promise.resolve({ locale: "en" }) })
      ).rejects.toThrow("NEXT_REDIRECT:/en/login");

      expect(mockRedirect).toHaveBeenCalledWith("/en/login");
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it("muestra el Estado Vacío amigable cuando no hay cursos ni eventos inscritos", async () => {
      mockGetCurrentUser.mockResolvedValueOnce({
        id: "user-1",
        name: "María González",
        email: "maria@ejemplo.com",
      });
      mockFindMany.mockResolvedValueOnce([]);

      const ui = await UserDashboardPage({
        params: Promise.resolve({ locale: "es" }),
      });
      render(ui);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: "user-1",
            status: "REGISTERED",
          },
          include: {
            course: true,
            event: true,
          },
        })
      );

      expect(
        screen.getByRole("heading", { name: /mi panel de aprendizaje/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Aún no tienes cursos inscritos")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /explorar catálogo/i })
      ).toHaveAttribute("href", "/es/courses");
    });

    it("separa y muestra las tarjetas de Mis Cursos y Mis Eventos inscritos", async () => {
      mockGetCurrentUser.mockResolvedValueOnce({
        id: "user-1",
        name: "María González",
        email: "maria@ejemplo.com",
      });
      mockFindMany.mockResolvedValueOnce([
        {
          id: "enr-course-1",
          status: "REGISTERED",
          date: new Date("2026-10-29T12:00:00.000Z"),
          userId: "user-1",
          courseId: "course-1",
          eventId: null,
          course: {
            id: "course-1",
            slug: "excel",
            title: "Excel Práctico",
            shortDescription: "Domina hojas de cálculo desde cero.",
            description: "Curso completo de Excel.",
            image: "/images/courses/excel.jpg",
            icon: null,
            video: null,
            color: "#10B982",
            type: "CURSO",
            stage: "UNO",
            categories: ["Productividad"],
            skills: ["Fórmulas"],
            duration: "8 horas",
            sessions: 4,
            hoursPerSession: 2,
            modality: "En línea",
            participants: "25",
            targetAudience: "Docentes",
            objective: "Aprender Excel",
            requirements: "Computadora",
            backgroundPattern: "GRID",
            featured: true,
            featuredOrder: 1,
            clickable: true,
            isActive: true,
            createdAt: new Date("2026-09-01T00:00:00.000Z"),
            updatedAt: new Date("2026-09-01T00:00:00.000Z"),
          },
          event: null,
        },
        {
          id: "enr-event-1",
          status: "REGISTERED",
          date: new Date("2026-10-30T12:00:00.000Z"),
          userId: "user-1",
          courseId: null,
          eventId: "event-1",
          course: null,
          event: {
            id: "event-1",
            title: "Taller de Herramientas Digitales",
            description: "Sesión interactiva en vivo.",
            image: "",
            date: new Date("2026-11-15T00:00:00.000Z"),
            time: "18:00 hrs",
            modality: "ONLINE",
            category: "tecnologia",
            profile: "Docentes",
            objective: "Explorar herramientas colaborativas.",
            duration: "2 horas",
            participants: "50",
            requirements: null,
            location: null,
            address: null,
            platform: "https://zoom.us/j/123456789",
            isActive: true,
            createdAt: new Date("2026-10-01T00:00:00.000Z"),
            updatedAt: new Date("2026-10-01T00:00:00.000Z"),
          },
        },
      ]);

      const ui = await UserDashboardPage({
        params: Promise.resolve({ locale: "es" }),
      });
      render(ui);

      // Pestaña por defecto: Mis Cursos
      expect(screen.getByText("Excel Práctico")).toBeInTheDocument();
      const goToCourseLink = screen.getByRole("link", { name: /ir al curso/i });
      expect(goToCourseLink).toHaveAttribute("href", "/es/courses/excel");

      // Cambiar a pestaña: Mis Eventos
      fireEvent.click(screen.getByRole("tab", { name: /mis eventos/i }));

      expect(
        screen.getByText("Taller de Herramientas Digitales")
      ).toBeInTheDocument();
      const goToEventLink = screen.getByRole("link", { name: /ir al evento/i });
      expect(goToEventLink).toHaveAttribute(
        "href",
        "https://zoom.us/j/123456789"
      );
    });
  });
});

