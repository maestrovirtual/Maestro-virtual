/**
 * @jest-environment node
 */

import { createEventAction, updateEventAction } from "@/features/admin/actions/event.actions";
import prisma from "@/lib/prisma/client";
import { uploadEventImage } from "@/lib/storage";
import { requireStaffApi } from "@/lib/auth/dal";

jest.mock("@/lib/prisma/client", () => ({
  __esModule: true,
  default: {
    event: {
      create: jest.fn(),
      update: jest.fn(),
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
    uploadEventImage: jest.fn(),
  };
});

describe("Server Action: createEventAction y updateEventAction con Storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createEventAction", () => {
    it("bloquea la creación del evento si el usuario no tiene permisos de staff", async () => {
      (requireStaffApi as jest.Mock).mockResolvedValueOnce({ status: 401 });

      const formData = new FormData();
      formData.append("title", "Evento Bloqueado");

      const result = await createEventAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/No autorizado/i);
      expect(prisma.event.create).not.toHaveBeenCalled();
      expect(uploadEventImage).not.toHaveBeenCalled();
    });

    it("sube la imagen a Storage cuando se recibe un File en FormData y guarda la URL en Prisma", async () => {
      const mockPublicUrl = "https://supabase.co/storage/v1/object/public/events/123-banner.jpg";
      (uploadEventImage as jest.Mock).mockResolvedValue({
        url: mockPublicUrl,
        path: "events/123-banner.jpg",
      });

      const mockEvent = {
        id: "event-abc",
        title: "Taller de Robótica",
        description: "Aprende conceptos de robótica",
        image: mockPublicUrl,
        date: new Date("2026-11-20"),
        time: "10:00 - 12:00 hrs",
        modality: "ONLINE",
        category: "tecnologia",
        isActive: true,
      };

      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const formData = new FormData();
      formData.append("title", "Taller de Robótica");
      formData.append("description", "Aprende conceptos de robótica");
      formData.append("date", "2026-11-20");
      formData.append("modality", "ONLINE");

      const file = new File(["fake-image-data"], "robot.jpg", { type: "image/jpeg" });
      formData.append("image", file);

      const result = await createEventAction(formData);

      expect(uploadEventImage).toHaveBeenCalledWith(file);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Taller de Robótica",
          image: mockPublicUrl,
        }),
      });
      expect(result.success).toBe(true);
      expect(result.data?.image).toBe(mockPublicUrl);
    });

    it("sube la imagen de patrocinadores y guarda sponsorsImageUrl en Prisma", async () => {
      const mockSponsorsUrl = "https://supabase.co/storage/v1/object/public/events/sponsors-aliados.png";
      (uploadEventImage as jest.Mock).mockResolvedValue({
        url: mockSponsorsUrl,
        path: "events/sponsors-aliados.png",
      });

      const mockEvent = {
        id: "event-sponsors",
        title: "Taller con Aliados",
        description: "Detalle del evento",
        image: "/images/events/default.jpg",
        sponsorsImageUrl: mockSponsorsUrl,
        date: new Date("2026-11-20"),
        time: "10:00 - 12:00 hrs",
        modality: "ONLINE",
        category: "general",
        isActive: true,
      };

      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const formData = new FormData();
      formData.append("title", "Taller con Aliados");
      formData.append("description", "Detalle del evento");
      formData.append("date", "2026-11-20");
      formData.append("modality", "ONLINE");

      const sponsorsFile = new File(["fake-sponsors-bytes"], "aliados.png", { type: "image/png" });
      formData.append("sponsorsImage", sponsorsFile);

      const result = await createEventAction(formData);

      expect(uploadEventImage).toHaveBeenCalledWith(sponsorsFile);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Taller con Aliados",
          sponsorsImageUrl: mockSponsorsUrl,
        }),
      });
      expect(result.success).toBe(true);
      expect(result.data?.sponsorsImageUrl).toBe(mockSponsorsUrl);
    });

    it("devuelve { success: false, error } cuando la subida de imagen falla en el bloque try/catch", async () => {
      (uploadEventImage as jest.Mock).mockRejectedValue(
        new Error("Fallo de conexión al bucket de Supabase Storage")
      );

      const formData = new FormData();
      formData.append("title", "Evento con fallo");
      formData.append("description", "Descripción");
      formData.append("date", "2026-11-20");

      const file = new File(["fake-image-data"], "robot.jpg", { type: "image/jpeg" });
      formData.append("image", file);

      const result = await createEventAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Fallo de conexión al bucket de Supabase Storage/i);
      expect(prisma.event.create).not.toHaveBeenCalled();
    });

    it("valida que el archivo sea una imagen permitida", async () => {
      const formData = new FormData();
      formData.append("title", "Evento Archivo Inválido");
      formData.append("description", "Descripción");
      formData.append("date", "2026-11-20");

      const badFile = new File(["some text"], "malware.exe", { type: "application/x-msdownload" });
      formData.append("image", badFile);

      const result = await createEventAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/imagen válida/i);
      expect(uploadEventImage).not.toHaveBeenCalled();
      expect(prisma.event.create).not.toHaveBeenCalled();
    });

    it("valida que el archivo no supere el límite de 5MB", async () => {
      const formData = new FormData();
      formData.append("title", "Evento Archivo Grande");
      formData.append("description", "Descripción");
      formData.append("date", "2026-11-20");

      const hugeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "enorme.jpg", {
        type: "image/jpeg",
      });
      formData.append("image", hugeFile);

      const result = await createEventAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/excede el tamaño máximo/i);
      expect(uploadEventImage).not.toHaveBeenCalled();
    });

    it("funciona con datos estándar cuando no se adjunta archivo", async () => {
      const mockEvent = {
        id: "event-def",
        title: "Evento Sin Archivo",
        description: "Descripción",
        image: "/images/events/default.jpg",
        date: new Date("2026-11-20"),
        modality: "ONLINE",
        category: "general",
        isActive: true,
      };

      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const formData = new FormData();
      formData.append("title", "Evento Sin Archivo");
      formData.append("description", "Descripción");
      formData.append("date", "2026-11-20");

      const result = await createEventAction(formData);

      expect(uploadEventImage).not.toHaveBeenCalled();
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Evento Sin Archivo",
          image: "/images/events/default.jpg",
        }),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateEventAction con Storage", () => {
    it("sube nueva imagen a Storage al actualizar un evento existente con nuevo File", async () => {
      const mockNewImageUrl = "https://supabase.co/storage/v1/object/public/events/new-banner.png";
      (uploadEventImage as jest.Mock).mockResolvedValue({
        url: mockNewImageUrl,
        path: "events/new-banner.png",
      });

      const mockUpdatedEvent = {
        id: "event-xyz",
        title: "Evento Actualizado",
        image: mockNewImageUrl,
      };

      (prisma.event.update as jest.Mock).mockResolvedValue(mockUpdatedEvent);

      const formData = new FormData();
      formData.append("title", "Evento Actualizado");
      const file = new File(["new-image-bytes"], "nuevo-banner.png", { type: "image/png" });
      formData.append("image", file);

      const result = await updateEventAction("event-xyz", formData);

      expect(uploadEventImage).toHaveBeenCalledWith(file);
      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: "event-xyz" },
        data: expect.objectContaining({
          title: "Evento Actualizado",
          image: mockNewImageUrl,
        }),
      });
      expect(result.success).toBe(true);
    });
  });
});

