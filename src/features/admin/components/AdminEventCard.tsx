"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock3, Edit2, MapPin, Trash2, Users, Video } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { AdminEvent } from "../types/event.types";

interface AdminEventCardProps {
  event: AdminEvent;
  onEdit: () => void;
  onDelete: () => void;
  detailsHref?: string;
}

function formatDate(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

export default function AdminEventCard({
  event,
  onEdit,
  onDelete,
  detailsHref,
}: AdminEventCardProps) {
  const resolvedDetailsHref = detailsHref ?? `/es/admin/eventos/${event.id}`;
  const isImageValid = Boolean(event.image && event.image.trim() !== "");
  const isOnline =
    String(event.modality).toUpperCase() === "ONLINE" ||
    String(event.modality).toLowerCase() === "online";

  return (
    <Card variant="elevated" className="flex flex-col overflow-hidden p-0">
      {/* SECCIÓN DE LA IMAGEN */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {isImageValid ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400">
            Sin Imagen
          </div>
        )}

        {/* ETIQUETA DE ESTADO (Publicado / Borrador) */}
        <div
          className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${
            event.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
          }`}
        >
          {event.isActive ? "Publicado" : "Borrador"}
        </div>

        {/* ETIQUETA DE MODALIDAD */}
        <div
          className={`absolute top-4 right-4 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-sm ${
            isOnline ? "bg-blue-600" : "bg-emerald-600"
          }`}
        >
          {isOnline ? "En línea" : "Presencial"}
        </div>
      </div>

      {/* CONTENIDO TEXTUAL */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          className="text-lg font-bold tracking-tight text-text-primary line-clamp-1"
          title={event.title}
        >
          {event.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary line-clamp-2 min-h-[2.5rem]">
          {event.description}
        </p>

        {/* METADATA */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {event.date && (
            <div className="flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1 text-xs text-text-secondary border border-border">
              <Calendar size={13} className="text-slate-500" />
              <span>{formatDate(event.date)}</span>
            </div>
          )}

          {event.time && (
            <div className="flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1 text-xs text-text-secondary border border-border">
              <Clock3 size={13} className="text-slate-500" />
              <span>{event.time}</span>
            </div>
          )}

          {isOnline ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
              <Video size={13} className="text-blue-500" />
              <span>{event.platform || "En línea"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
              <MapPin size={13} className="text-emerald-500" />
              <span>{event.location || event.address || "Presencial"}</span>
            </div>
          )}

          {event.category && (
            <div className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary uppercase">
              {event.category}
            </div>
          )}
        </div>

        {/* ACCIONES DEL ADMIN */}
        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
          <Link
            href={resolvedDetailsHref}
            aria-label={`Ver inscritos de ${event.title}`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-primary shadow-sm transition-colors hover:bg-background"
          >
            <Users size={15} className="text-primary" />
            <span>Detalle e inscritos</span>
          </Link>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 gap-1.5"
              aria-label={`Editar ${event.title}`}
            >
              <Edit2 size={15} />
              <span>Editar</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              className="flex-1 gap-1.5"
              aria-label={`Eliminar ${event.title}`}
            >
              <Trash2 size={15} />
              <span>Eliminar</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
