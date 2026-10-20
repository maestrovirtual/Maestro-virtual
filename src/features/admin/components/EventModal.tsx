"use client";

import { useState } from "react";
import { X, Save, Loader2, Image as ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createEventAction, updateEventAction } from "@/features/admin/actions/event.actions";
import type { AdminEvent, EventFormData } from "../types/event.types";

interface EventModalProps {
  isOpen: boolean;
  eventToEdit?: AdminEvent | null;
  onClose: () => void;
  onSaved: (event: AdminEvent) => void;
}

function toDateInputValue(val: string | Date | undefined): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export default function EventModal({
  isOpen,
  eventToEdit,
  onClose,
  onSaved,
}: EventModalProps) {
  if (!isOpen) return null;

  return (
    <EventModalDialog
      key={eventToEdit ? eventToEdit.id : "new-event"}
      eventToEdit={eventToEdit}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function EventModalDialog({
  eventToEdit,
  onClose,
  onSaved,
}: {
  eventToEdit?: AdminEvent | null;
  onClose: () => void;
  onSaved: (event: AdminEvent) => void;
}) {
  const isEditing = Boolean(eventToEdit);

  // Form states initialized directly from eventToEdit
  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [description, setDescription] = useState(eventToEdit?.description || "");
  const [date, setDate] = useState(toDateInputValue(eventToEdit?.date));
  const [time, setTime] = useState(eventToEdit?.time || "10:00 - 12:00 hrs");
  const [modality, setModality] = useState<"ONLINE" | "IN_PERSON">(
    String(eventToEdit?.modality).toUpperCase() === "IN_PERSON" ||
      String(eventToEdit?.modality).toLowerCase() === "presencial"
      ? "IN_PERSON"
      : "ONLINE"
  );
  const [category, setCategory] = useState(eventToEdit?.category || "general");
  const [image, setImage] = useState(eventToEdit?.image || "/images/events/default.jpg");
  const [platform, setPlatform] = useState(eventToEdit?.platform || "");
  const [location, setLocation] = useState(eventToEdit?.location || "");
  const [address, setAddress] = useState(eventToEdit?.address || "");
  const [profile, setProfile] = useState(eventToEdit?.profile || "");
  const [objective, setObjective] = useState(eventToEdit?.objective || "");
  const [duration, setDuration] = useState(eventToEdit?.duration || "");
  const [participants, setParticipants] = useState(eventToEdit?.participants || "");
  const [requirements, setRequirements] = useState(eventToEdit?.requirements || "");
  const [isActive, setIsActive] = useState(eventToEdit?.isActive ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!title.trim()) {
      setError("El título del evento es obligatorio.");
      return;
    }
    if (!date) {
      setError("La fecha del evento es obligatoria.");
      return;
    }
    if (!description.trim()) {
      setError("La descripción del evento es obligatoria.");
      return;
    }

    setIsSubmitting(true);

    const payload: Partial<EventFormData> = {
      title: title.trim(),
      description: description.trim(),
      date,
      time: time.trim() || undefined,
      modality,
      category: category.trim() || "general",
      image: image.trim() || "/images/events/default.jpg",
      platform: modality === "ONLINE" ? platform.trim() || null : null,
      location: modality === "IN_PERSON" ? location.trim() || null : null,
      address: modality === "IN_PERSON" ? address.trim() || null : null,
      profile: profile.trim() || null,
      objective: objective.trim() || null,
      duration: duration.trim() || null,
      participants: participants.trim() || null,
      requirements: requirements.trim() || null,
      isActive,
    };

    try {
      if (isEditing && eventToEdit) {
        const result = await updateEventAction(eventToEdit.id, payload);
        if (!result.success || !result.data) {
          setError(result.error || "Error al actualizar el evento.");
          setIsSubmitting(false);
          return;
        }
        onSaved(result.data);
      } else {
        const result = await createEventAction(payload);
        if (!result.success || !result.data) {
          setError(result.error || "Error al crear el evento.");
          setIsSubmitting(false);
          return;
        }
        onSaved(result.data);
      }
      onClose();
    } catch {
      setError("Ocurrió un error inesperado al procesar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-surface shadow-2xl">
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id="event-modal-title" className="text-xl font-bold tracking-tight text-text-primary">
              {isEditing ? `Editar Evento: ${eventToEdit?.title}` : "Crear Nuevo Evento"}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {isEditing
                ? "Modifica los campos necesarios y guarda los cambios."
                : "Ingresa los detalles para publicar un nuevo evento en la agenda."}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary dark:hover:bg-slate-800"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORMULARIO SCROLLABLE */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            {/* SECCIÓN 1: INFORMACIÓN PRINCIPAL */}
            <Card variant="default" className="p-5">
              <h3 className="mb-4 text-base font-bold text-text-primary border-b border-border pb-2">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Título del Evento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Taller de Inteligencia Artificial para Docentes"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="general">General</option>
                    <option value="tecnologia">Tecnología</option>
                    <option value="educacion">Educación</option>
                    <option value="emprendimiento">Inclusión: Emprendimiento</option>
                    <option value="alfabetizacion">Inclusión: Alfabetización</option>
                    <option value="zoom">Zoom</option>
                    <option value="excel">Excel</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="canva">Canva</option>
                    <option value="classroom">Google Classroom</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    URL de la Imagen / Portada
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="/images/events/default.jpg"
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary pr-9"
                    />
                    <ImageIcon size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Descripción del Evento <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe de qué trata el evento, dinámicas y valor para los asistentes..."
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>
              </div>
            </Card>

            {/* SECCIÓN 2: FECHA, HORARIO Y MODALIDAD */}
            <Card variant="default" className="p-5">
              <h3 className="mb-4 text-base font-bold text-text-primary border-b border-border pb-2">
                Fecha, Horario y Modalidad
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Fecha del Evento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Horario
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Ej. 10:00 - 12:00 hrs"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Modalidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as "ONLINE" | "IN_PERSON")}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="ONLINE">En línea</option>
                    <option value="IN_PERSON">Presencial</option>
                  </select>
                </div>

                {modality === "ONLINE" ? (
                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Plataforma Virtual
                    </label>
                    <input
                      type="text"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      placeholder="Ej. Zoom, Google Meet, Teams"
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5 md:col-span-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Lugar / Sede
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ej. Auditorio Principal"
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Dirección Física
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ej. Av. Universidad 123, Col. Centro"
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* SECCIÓN 3: AUDIENCIA Y REQUISITOS */}
            <Card variant="default" className="p-5">
              <h3 className="mb-4 text-base font-bold text-text-primary border-b border-border pb-2">
                Audiencia y Requisitos
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Perfil del Participante
                  </label>
                  <input
                    type="text"
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    placeholder="Ej. Docentes, directivos..."
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Capacidad / Participantes
                  </label>
                  <input
                    type="text"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="Ej. 10 – 15 por capacitador"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ej. 2 horas"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Objetivo del Evento
                  </label>
                  <textarea
                    rows={2}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Propósito formativo o metas del evento..."
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Requisitos
                  </label>
                  <textarea
                    rows={2}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Ej. Laptop con conexión a internet, cuenta de Google activa..."
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>
              </div>
            </Card>

            {/* SECCIÓN 4: ESTADO DE PUBLICACIÓN */}
            <Card variant="default" className="p-5">
              <h3 className="mb-4 text-base font-bold text-text-primary border-b border-border pb-2">
                Estado de Publicación
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActiveEvent"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isActiveEvent" className="text-sm font-medium text-text-primary cursor-pointer select-none">
                  Publicado (Visible en la agenda pública de eventos)
                </label>
              </div>
              <p className="mt-1 text-xs text-text-secondary ml-8">
                Si está desactivado, el evento se guardará en estado «Borrador» y solo será visible en el panel administrativo.
              </p>
            </Card>
          </div>

          {/* FOOTER DEL MODAL CON BOTONES DE ACCIÓN */}
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-surface">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? "Actualizar Evento" : "Guardar Evento"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
