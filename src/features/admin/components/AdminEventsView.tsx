"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays } from "lucide-react";
import Button from "@/components/ui/Button";
import AdminEventCard from "@/features/admin/components/AdminEventCard";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import EventModal from "@/features/admin/components/EventModal";
import DeleteConfirmModal from "@/features/admin/components/DeleteConfirmModal";
import type { AdminEvent } from "../types/event.types";

interface AdminEventsPageProps {
  initialEvents?: AdminEvent[];
  locale?: string;
}

export default function AdminEventsPage({
  initialEvents = [],
  locale = "es",
}: AdminEventsPageProps) {
  const router = useRouter();
  const [events, setEvents] = useState<AdminEvent[]>(initialEvents);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<AdminEvent | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<AdminEvent | null>(null);

  // Sync if initialEvents changes
  const [prevInitialEvents, setPrevInitialEvents] = useState(initialEvents);
  if (initialEvents !== prevInitialEvents) {
    setPrevInitialEvents(initialEvents);
    setEvents(initialEvents);
  }

  // Fetch fallback if needed
  useEffect(() => {
    if (initialEvents.length === 0) {
      const fetchEvents = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/events?all=true");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              setEvents(data);
            }
          }
        } catch {
          // Keep current state
        } finally {
          setLoading(false);
        }
      };

      fetchEvents();
    }
  }, [initialEvents.length]);

  const handleOpenCreate = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: AdminEvent) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (event: AdminEvent) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleEventSaved = (savedEvent: AdminEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === savedEvent.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      }
      return [savedEvent, ...prev];
    });
    router.refresh();
  };

  const handleEventDeleted = (deletedEventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== deletedEventId));
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* BARRA LATERAL */}
      <AdminSidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* HEADER DE LA PÁGINA */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">
              Administrar Eventos
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Crea, edita o elimina los eventos y talleres disponibles en la plataforma.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleOpenCreate}
            className="self-start sm:self-auto gap-2 shadow-sm"
          >
            <Plus size={18} />
            Crear Nuevo Evento
          </Button>
        </div>

        {/* CUADRÍCULA DE EVENTOS */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <AdminEventCard
                key={event.id}
                event={event}
                onEdit={() => handleOpenEdit(event)}
                onDelete={() => handleOpenDelete(event)}
                detailsHref={`/${locale}/admin/eventos/${event.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center bg-surface">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <CalendarDays size={32} />
            </div>
            <h3 className="text-lg font-bold text-text-primary">No hay eventos registrados</h3>
            <p className="mt-1 text-sm text-text-secondary max-w-sm">
              Comienza agregando el primer evento para que aparezca en la agenda y los usuarios puedan inscribirse.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreate}
              className="mt-6 gap-2"
            >
              <Plus size={16} />
              Crear Nuevo Evento
            </Button>
          </div>
        )}

        {/* MODAL PARA CREAR O EDITAR */}
        <EventModal
          isOpen={isModalOpen}
          eventToEdit={eventToEdit}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleEventSaved}
        />

        {/* MODAL PARA CONFIRMAR ELIMINACIÓN */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          event={eventToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={handleEventDeleted}
        />
      </main>
    </div>
  );
}
