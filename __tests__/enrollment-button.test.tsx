import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import EnrollButton from "@/features/enrollments/components/EnrollButton";
import { enrollUserAction } from "@/features/enrollments/actions/enrollment.actions";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
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

  it("renderiza el estado No Logueado y redirige a /login?next=${currentPath} al hacer clic", () => {
    render(
      <EnrollButton
        itemId="course-zoom-1"
        itemType="COURSE"
        isEnrolled={false}
        isLoggedIn={false}
        currentPath="/es/courses/zoom"
      />
    );

    const button = screen.getByRole("button", { name: /inscribirme/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/login?next=/es/courses/zoom");
    expect(mockedEnrollUserAction).not.toHaveBeenCalled();
  });

  it("renderiza el estado Activo (logueado y no inscrito) y ejecuta enrollUserAction al hacer clic", async () => {
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

    const button = screen.getByRole("button", { name: /inscribirme/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockedEnrollUserAction).toHaveBeenCalledWith(
        "course-zoom-1",
        "COURSE",
        "/es/courses/zoom"
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /ya estás inscrito/i })
      ).toBeDisabled();
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "¡Te has inscrito al curso con éxito!"
    );
  });
});

