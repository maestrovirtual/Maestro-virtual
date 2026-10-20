import EventsClient from "./EventsClient";
import prisma from "@/lib/prisma/client";
import type { EventItem } from "@/types/event";

async function fetchEventosReales(): Promise<EventItem[] | undefined> {
  try {
    console.log("🕵️ Consultando BD para eventos con límite de tiempo (4s)...");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Supabase tardó demasiado en responder")), 4000)
    );

    // ✨ Filtramos el pasado, solo activos y ordenamos el futuro
    const dbQuery = prisma.event.findMany({
      where: {
        isActive: true, // Solo eventos publicados
        date: {
          gte: new Date(), // Solo trae eventos de hoy en adelante
        },
      },
      orderBy: {
        date: "asc", // Muestra el evento más próximo primero
      },
      take: 4, // Límite de eventos para no saturar la portada
    });

    const data = await Promise.race([dbQuery, timeoutPromise]);

    if (!Array.isArray(data)) {
      return undefined;
    }

    console.log("✅ Eventos recibidos directo de la BD:", data.length);

    // Mapear los campos del modelo Prisma Event a la interfaz EventItem
    return data.map((e) => {
      let dateString = "";
      if (e.date instanceof Date) {
        dateString = e.date.toISOString().split("T")[0];
      } else if (typeof e.date === "string") {
        dateString = e.date.includes("T") ? e.date.split("T")[0] : e.date;
      }

      return {
        id: e.id,
        title: e.title,
        category: (e.category || "general") as EventItem["category"],
        profile: e.profile || "Público en general",
        objective: e.objective || e.description || "",
        duration: e.duration || "Por definir",
        participants: e.participants || "Por definir",
        date: dateString,
        time: e.time || "Por definir",
        modality: String(e.modality).toUpperCase() === "IN_PERSON" ? "presencial" : "online",
        location: e.location || undefined,
        address: e.address || undefined,
        platform: e.platform || undefined,
        requirements: e.requirements || undefined,
      };
    });
  } catch (error) {
    console.error("🚨 Falla en Prisma (Eventos):", error instanceof Error ? error.message : error);
    return undefined; // EventsClient activará los mocks al recibir undefined
  }
}

export default async function EventsSection() {
  const eventosAPI = await fetchEventosReales();

  return <EventsClient eventosDelBackend={eventosAPI} />;
}