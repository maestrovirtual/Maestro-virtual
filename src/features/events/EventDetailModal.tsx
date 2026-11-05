"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Users,
  Video,
  X,
  CheckCircle,
  UserCheck,
  ZoomIn,
  FileText,
} from "lucide-react";

import type { EventItem } from "@/types/event";
import EnrollButton from "@/features/enrollments/components/EnrollButton";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  categoryColor?: string;
  categoryLabel?: string;
  isEnrolled?: boolean;
  isLoggedIn?: boolean;
  currentPath?: string;
}

export default function EventDetailModal({
  isOpen,
  onClose,
  event,
  categoryColor = "#2563EB",
  categoryLabel = "General",
  isEnrolled = false,
  isLoggedIn = false,
  currentPath = "/events",
}: EventDetailModalProps) {
  const titleId = useId();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      }
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, isLightboxOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const isOnline = String(event.modality).toLowerCase() === "online";
  const safeDateStr = String(event.date || "");
  const dateObj = safeDateStr.includes("T")
    ? new Date(safeDateStr)
    : new Date(`${safeDateStr}T00:00:00`);
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const formattedDate = validDate.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hasImage = Boolean(event.image && event.image.trim() !== "");

  return createPortal(
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-6 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col max-h-[92vh] w-full max-w-4xl lg:max-w-5xl overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-xl animate-scaleUp"
        >
          {/* HEADER BAR */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm border border-black/5 dark:border-white/10"
                style={{
                  backgroundColor: `${categoryColor}18`,
                  color: categoryColor,
                }}
              >
                {categoryLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm">
                {isOnline ? (
                  <Video className="h-3 w-3 text-blue-500 shrink-0" />
                ) : (
                  <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                )}
                {isOnline ? "En línea" : "Presencial"}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ventana de detalles"
              className="rounded-full p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6">
            {/* AFICHE GRANDE / IMAGEN COMPLETA SIN RECORTES */}
            {hasImage && event.image && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsLightboxOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsLightboxOpen(true);
                  }
                }}
                title="Clic para ver afiche en pantalla completa"
                className="relative group/poster w-full h-80 sm:h-[480px] md:h-[560px] lg:h-[620px] max-h-[70vh] rounded-2xl overflow-hidden bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-slate-800 flex items-center justify-center p-3 shadow-inner cursor-zoom-in transition-all hover:border-primary/40"
              >
                <Image
                  src={event.image}
                  alt={`Afiche promocional de ${event.title}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  className="object-contain p-2 transition-transform duration-300 group-hover/poster:scale-[1.01]"
                  quality={95}
                  unoptimized={event.image.startsWith("http")}
                />

                {/* BOTÓN OVERLAY PARA PANTALLA COMPLETA */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                  <span className="opacity-90 group-hover/poster:opacity-100 bg-black/75 hover:bg-black/90 text-white text-xs px-3.5 py-1.5 rounded-full backdrop-blur-sm transition-all flex items-center gap-1.5 shadow">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Pantalla completa</span>
                  </span>
                  <a
                    href={event.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-90 hover:opacity-100 bg-black/75 hover:bg-black/90 text-white text-xs p-1.5 rounded-full backdrop-blur-sm transition-all shadow"
                    title="Abrir imagen original en nueva pestaña"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* TÍTULO Y OBJETIVO */}
            <div>
              <h2
                id={titleId}
                className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-gray-900 dark:text-gray-100 tracking-tight"
              >
                {event.title}
              </h2>
              {event.objective && event.objective !== event.description ? (
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {event.objective}
                </p>
              ) : !event.description ? (
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {event.objective || "Información y detalles del evento."}
                </p>
              ) : null}
            </div>

            {/* METADATOS CLAVE EN GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/60 p-3.5 shadow-sm">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
                >
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Fecha
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize block truncate">
                    {formattedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/60 p-3.5 shadow-sm">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
                >
                  <Clock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Horario y Duración
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 block truncate">
                    {event.time || "Por definir"}
                    {event.duration ? ` · ${event.duration}` : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/60 p-3.5 shadow-sm">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
                >
                  {isOnline ? (
                    <Video className="h-5 w-5 text-blue-500 shrink-0" />
                  ) : (
                    <MapPin className="h-5 w-5 text-emerald-500 shrink-0" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Modalidad / Lugar
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 block truncate">
                    {isOnline
                      ? `En línea vía ${event.platform || "plataforma digital"}`
                      : event.location
                      ? `${event.location}${event.address ? ` — ${event.address}` : ""}`
                      : event.address || "Presencial"}
                  </span>
                </div>
              </div>

              {event.participants && (
                <div className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/60 p-3.5 shadow-sm">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                    style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
                  >
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                      Cupo / Participantes
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 block truncate">
                      {event.participants}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* DESCRIPCIÓN DEL EVENTO */}
            {(event.description || event.sponsorsImageUrl) && (
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span>Descripción</span>
                </div>
                {event.description && (
                  <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 pl-6 whitespace-pre-wrap">
                    {event.description}
                  </div>
                )}
                {event.sponsorsImageUrl && (
                  <div className="pl-6">
                    <Image
                      src={event.sponsorsImageUrl}
                      alt="Patrocinadores y aliados del evento"
                      width={800}
                      height={400}
                      unoptimized={event.sponsorsImageUrl.startsWith("http")}
                      className="w-full h-auto object-contain rounded-lg mt-4"
                    />
                  </div>
                )}
              </div>
            )}

            {/* PERFIL DEL PARTICIPANTE */}
            {event.profile && (
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-4 sm:p-5 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
                  <UserCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>¿A quién está dirigido? (Perfil del participante)</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 pl-6">
                  {event.profile}
                </p>
              </div>
            )}

            {/* REQUISITOS */}
            {event.requirements && (
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-4 sm:p-5 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Requisitos de participación</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 pl-6">
                  {event.requirements}
                </p>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between gap-4 border-t border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-sm sticky bottom-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cerrar
            </button>

            <EnrollButton
              itemId={event.id}
              itemType="EVENT"
              isEnrolled={isEnrolled}
              isLoggedIn={isLoggedIn}
              currentPath={currentPath}
              accentColor={categoryColor}
              label="Inscribirme al evento"
              className="px-6 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* LIGHTBOX ULTRA PANTALLA COMPLETA */}
      {isLightboxOpen && hasImage && event.image && (
        <div
          role="dialog"
          aria-label="Afiche en pantalla completa"
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl animate-fadeIn p-4 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* BARRA SUPERIOR LIGHTBOX */}
          <div
            className="flex items-center justify-between gap-4 text-white pb-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold truncate text-white/90">
                {event.title}
              </span>
              <span className="text-xs text-white/60">· Afiche en alta resolución</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={event.image}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 transition-colors"
                title="Abrir imagen original"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Abrir original</span>
              </a>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="rounded-full bg-white/10 hover:bg-white/25 p-2 text-white transition-colors cursor-pointer"
                title="Cerrar pantalla completa (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* CONTENEDOR DEL AFICHE PANTALLA COMPLETA */}
          <div
            className="relative flex-1 w-full h-full flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={event.image}
              alt={`Afiche en alta resolución: ${event.title}`}
              fill
              priority
              sizes="100vw"
              quality={100}
              className="object-contain"
              unoptimized={event.image.startsWith("http")}
            />
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
