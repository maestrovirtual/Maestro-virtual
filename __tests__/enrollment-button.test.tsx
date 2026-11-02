import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import EnrollButton from "@/features/enrollments/components/EnrollButton";
import { enrollUserAction } from "@/features/enrollments/actions/enrollment.actions";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockUseParams = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useParams: () => mockUseParams(),
}));

jest.mock("@/features/enrollments/actions/enrollment.actions", () => ({
  enrollUserAction: jest.fn(),
}));

const mockedEnrollUserAction = enrollUserAction as jest.MockedFunction<
  typeof enrollUserAction
>;

describe("EnrollButton (MV-37)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ locale: "es" });
  });

  it("renderiza el estado Inscrito (deshabilitado con el texto 'Ya estás inscrito')", () => {
    render(
      <EnrollButton
        itemId="course-zoom-1"
        itemType="COURSE"
        isEnrolled={true}
        isLoggedIn={true}
        currentPath="/es/courses/zoom"
      />
    );

    const button = screen.getByRole("button", { name: /ya estás inscrito/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("renderiza el estado No Logueado y redirige a /${locale}/login?next=${currentPath} evitando error 404", () => {
    mockUseParams.mockReturnValue({ locale: "en" });

    render(
      <EnrollButton
        itemId="course-zoom-1"
        itemType="COURSE"
        isEnrolled={false}
        isLoggedIn={false}
        currentPath="/en/courses/zoom"
      />
    );

    const button = screen.getByRole("button", { name: /inscribirme/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/en/login?next=/en/courses/zoom");
    expect(mockedEnrollUserAction).not.toHaveBeenCalled();
  });

  it("permite abrir el modal de formulario y cerrarlo con el botón Cancelar sin inscribir", () => {
    render(
      <EnrollButton
        itemId="course-zoom-1"
        itemType="COURSE"
        isEnrolled={false}
        isLoggedIn={true}
        currentPath="/es/courses/zoom"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /inscribirme/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/¿estás seguro que deseas inscribirte a este curso\?/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockedEnrollUserAction).not.toHaveBeenCalled();
  });

  it("abre el modal con el formulario de confirmación, ejecuta enrollUserAction al confirmar y cambia el botón a 'Ya estás inscrito'", async () => {
    mockedEnrollUserAction.mockResolvedValueOnce({
      success: true,
      enrollmentId: "enr-123",
      message: "¡Te has inscrito al curso con éxito!",
    });

    render(
      <EnrollButton
        itemId="course-zoom-1"
        itemType="COURSE"
        isEnrolled={false}
        isLoggedIn={true}
        currentPath="/es/courses/zoom"
      />
    );

    const triggerButton = screen.getByRole("button", { name: /inscribirme/i });
    fireEvent.click(triggerButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", {
      name: /confirmar inscripción/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedEnrollUserAction).toHaveBeenCalledTimes(1);
    });

    const passedFormData = mockedEnrollUserAction.mock.calls[0][0] as FormData;
    expect(passedFormData).toBeInstanceOf(FormData);
    expect(passedFormData.get("itemId")).toBe("course-zoom-1");
    expect(passedFormData.get("itemType")).toBe("COURSE");
    expect(passedFormData.get("currentPath")).toBe("/es/courses/zoom");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ya estás inscrito/i })
      ).toBeDisabled();
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "¡Te has inscrito al curso con éxito!"
    );
  });
});
