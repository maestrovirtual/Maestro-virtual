import EventsClient from "./EventsClient";
import prisma from "@/lib/prisma/client";
import type { EventItem } from "@/types/event";

async function fetchEventosReales(): Promise<EventItem[]> {
  try {
    const data = await prisma.event.findMany();
    // Forzamos el tipado para que TypeScript esté feliz
    return data as unknown as EventItem[];
  } catch (error) {
    console.error("🚨 Falla en Prisma (Eventos):", error);
    return []; 
  }
}

export default async function EventsSection() {
  const eventosAPI = await fetchEventosReales();
  
  return (
    <EventsClient eventosDelBackend={eventosAPI} />
  );
}