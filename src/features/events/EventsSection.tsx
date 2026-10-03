import EventsClient from "./EventsClient";
import prisma from "@/lib/prisma/client";
import type { EventItem } from "@/types/event";

async function fetchEventosReales(): Promise<EventItem[] | undefined> {
  try {
    console.log("🕵️ Consultando BD para eventos con límite de tiempo (4s)...");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Supabase tardó demasiado en responder")), 4000)
    );

    // ✨ LA MEJORA: Filtramos el pasado y ordenamos el futuro
    const dbQuery = prisma.event.findMany({
      where: {
        date: {
          gte: new Date(), // Solo trae eventos de hoy en adelante
        }
      },
      orderBy: {
        date: 'asc' // Muestra el evento más próximo primero
      },
      take: 4, // (Opcional) Límite de eventos para no saturar la portada
    });

    const data = await Promise.race([dbQuery, timeoutPromise]);

    console.log("✅ Eventos recibidos directo de la BD:", Array.isArray(data) ? data.length : 0);
    return data as unknown as EventItem[];
  } catch (error) {
    console.error("🚨 Falla en Prisma (Eventos):", error instanceof Error ? error.message : error);
    return undefined; // EventsClient activará los mocks al recibir undefined
  }
}

export default async function EventsSection() {
  const eventosAPI = await fetchEventosReales();

  return (
    <EventsClient eventosDelBackend={eventosAPI} />
  );
}