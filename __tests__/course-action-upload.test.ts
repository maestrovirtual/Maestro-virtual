/**
 * @jest-environment node
 */

import {
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
} from "@/features/admin/actions/course.actions";
import prisma from "@/lib/prisma/client";
import { uploadCourseImage, validateImageFile, MAX_IMAGE_SIZE } from "@/lib/storage";
import { requireStaffApi } from "@/lib/auth/dal";

jest.mock("@/lib/prisma/client", () => ({
  __esModule: true,
  default: {
    course: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/auth/dal", () => ({
  requireStaffApi: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/lib/storage", () => {
  const original = jest.requireActual("@/lib/storage");
  return {
    ...original,
    uploadCourseImage: jest.fn(),
  };
});

describe("Server Action: createCourseAction y updateCourseAction con Storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCourseAction", () => {
    it("bloquea la creación del curso si el usuario no tiene permisos de staff", async () => {
      (requireStaffApi as jest.Mock).mockResolvedValueOnce({ status: 401 });

      const formData = new FormData();
      formData.append("title", "Curso Bloqueado");
      formData.append("slug", "curso-bloqueado");
      formData.append("description", "Descripción de prueba");

      const result = await createCourseAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/No autorizado/i);
      expect(prisma.course.create).not.toHaveBeenCalled();
      expect(uploadCourseImage).not.toHaveBeenCalled();
    });

    it("sube la portada a Storage cuando se recibe un File en FormData y guarda la URL en Prisma", async () => {
      const mockPublicUrl =
        "https://fqwgfgppvlqgddxvzixu.supabase.co/storage/v1/object/public/events/courses/123-flyer.jpg";
      (uploadCourseImage as jest.Mock).mockResolvedValue({
        url: mockPublicUrl,
        path: "courses/123-flyer.jpg",
      });

      const mockCourse = {
        id: "course-123",
        title: "Inteligencia Artificial para Docentes",
        slug: "ia-para-docentes",
        description: "Aprende herramientas de IA aplicadas a la educación.",
        image: mockPublicUrl,
        type: "CURSO",
        stage: "UNO",
        backgroundPattern: "GRID",
        color: "#2563EB",
        isActive: true,
      };

      (prisma.course.create as jest.Mock).mockResolvedValue(mockCourse);

      const formData = new FormData();
      formData.append("title", "Inteligencia Artificial para Docentes");
      formData.append("slug", "ia-para-docentes");
      formData.append("description", "Aprende herramientas de IA aplicadas a la educación.");
      formData.append("type", "CURSO");
      formData.append("stage", "1");

      const file = new File(["fake-image-data"], "flyer.jpg", { type: "image/jpeg" });
      formData.append("image", file);

      const result = await createCourseAction(formData);

      expect(uploadCourseImage).toHaveBeenCalledWith(file);
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Inteligencia Artificial para Docentes",
          slug: "ia-para-docentes",
          image: mockPublicUrl,
        }),
      });
      expect(result.success).toBe(true);
      expect(result.data?.image).toBe(mockPublicUrl);
    });

    it("devuelve { success: false, error } cuando la subida de imagen falla en el bloque try/catch", async () => {
      (uploadCourseImage as jest.Mock).mockRejectedValue(
        new Error("Fallo al conectar con el bucket de Supabase")
      );

      const formData = new FormData();
      formData.append("title", "Curso con Error");
      formData.append("slug", "curso-error");
      formData.append("description", "Descripción");

      const file = new File(["fake-image-data"], "error.jpg", { type: "image/jpeg" });
      formData.append("image", file);

      const result = await createCourseAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Fallo al conectar con el bucket de Supabase");
      expect(prisma.course.create).not.toHaveBeenCalled();
    });

    it("rechaza archivos con formato no soportado", async () => {
      const formData = new FormData();
      formData.append("title", "Curso PDF");
      formData.append("slug", "curso-pdf");
      formData.append("description", "Descripción");

      const invalidFile = new File(["pdf content"], "doc.pdf", { type: "application/pdf" });
      formData.append("image", invalidFile);

      const result = await createCourseAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/imagen válida/i);
      expect(uploadCourseImage).not.toHaveBeenCalled();
      expect(prisma.course.create).not.toHaveBeenCalled();
    });

    it("rechaza archivos que superen los 5MB", () => {
      const largeFile = new File([new ArrayBuffer(MAX_IMAGE_SIZE + 1024)], "huge.jpg", {
        type: "image/jpeg",
      });

      const validation = validateImageFile(largeFile);
      expect(validation.valid).toBe(false);
      expect(validation.error).toMatch(/5MB/);
    });

    it("usa la imagen por defecto si no se adjunta archivo", async () => {
      const mockCourse = {
        id: "course-default",
        title: "Curso Sin Imagen",
        slug: "curso-sin-imagen",
        description: "Descripción",
        image: "/images/courses/default.jpg",
        type: "CURSO",
        stage: "UNO",
        backgroundPattern: "GRID",
        color: "#2563EB",
        isActive: true,
      };

      (prisma.course.create as jest.Mock).mockResolvedValue(mockCourse);

      const formData = new FormData();
      formData.append("title", "Curso Sin Imagen");
      formData.append("slug", "curso-sin-imagen");
      formData.append("description", "Descripción");

      const result = await createCourseAction(formData);

      expect(uploadCourseImage).not.toHaveBeenCalled();
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          image: "/images/courses/default.jpg",
        }),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateCourseAction", () => {
    it("bloquea la actualización si no es staff", async () => {
      (requireStaffApi as jest.Mock).mockResolvedValueOnce({ status: 403 });

      const result = await updateCourseAction("course-123", { title: "Nuevo Título" });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/No autorizado/i);
      expect(prisma.course.update).not.toHaveBeenCalled();
    });

    it("sube una nueva portada y actualiza la URL en la base de datos", async () => {
      const newUrl =
        "https://fqwgfgppvlqgddxvzixu.supabase.co/storage/v1/object/public/events/courses/new-flyer.png";
      (uploadCourseImage as jest.Mock).mockResolvedValue({
        url: newUrl,
        path: "courses/new-flyer.png",
      });

      (prisma.course.update as jest.Mock).mockResolvedValue({
        id: "course-123",
        title: "Curso Modificado",
        image: newUrl,
      });

      const formData = new FormData();
      formData.append("title", "Curso Modificado");
      const newFile = new File(["new-image"], "new-flyer.png", { type: "image/png" });
      formData.append("image", newFile);

      const result = await updateCourseAction("course-123", formData);

      expect(uploadCourseImage).toHaveBeenCalledWith(newFile);
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: "course-123" },
        data: expect.objectContaining({
          title: "Curso Modificado",
          image: newUrl,
        }),
      });
      expect(result.success).toBe(true);
      expect(result.data?.image).toBe(newUrl);
    });

    it("mantiene la imagen existente si no se adjunta un nuevo archivo", async () => {
      (prisma.course.update as jest.Mock).mockResolvedValue({
        id: "course-123",
        title: "Título Actualizado",
      });

      const formData = new FormData();
      formData.append("title", "Título Actualizado");

      const result = await updateCourseAction("course-123", formData);

      expect(uploadCourseImage).not.toHaveBeenCalled();
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: "course-123" },
        data: expect.objectContaining({
          title: "Título Actualizado",
        }),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("deleteCourseAction", () => {
    it("bloquea el borrado si no es staff", async () => {
      (requireStaffApi as jest.Mock).mockResolvedValueOnce({ status: 401 });

      const result = await deleteCourseAction("course-123");

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/No autorizado/i);
      expect(prisma.course.delete).not.toHaveBeenCalled();
    });

    it("permite el borrado si es staff", async () => {
      (prisma.course.delete as jest.Mock).mockResolvedValue({ id: "course-123" });

      const result = await deleteCourseAction("course-123");

      expect(prisma.course.delete).toHaveBeenCalledWith({
        where: { id: "course-123" },
      });
      expect(result.success).toBe(true);
    });
  });
});
