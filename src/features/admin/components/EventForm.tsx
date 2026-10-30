"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Loader2, Save } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  createEventAction,
  updateEventAction,
} from "@/features/admin/actions/event.actions";
import type { AdminEvent, EventFormData } from "../types/event.types";

interface EventFormProps {
  eventToEdit?: AdminEvent | null;
  locale?: string;
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

export default function EventForm({
  eventToEdit,
  locale = "es",
}: EventFormProps) {
  const router = useRouter();
  const isEditing = Boolean(eventToEdit);

  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [description, setDescription] = useState(
    eventToEdit?.description || ""
  );
  const [date, setDate] = useState(toDateInputValue(eventToEdit?.date));
  const [time, setTime] = useState(eventToEdit?.time || "10:00 - 12:00 hrs");
  const [modality, setModality] = useState<"ONLINE" | "IN_PERSON">(
    String(eventToEdit?.modality).toUpperCase() === "IN_PERSON" ||
      String(eventToEdit?.modality).toLowerCase() === "presencial"
      ? "IN_PERSON"
      : "ONLINE"
  );
  const [category, setCategory] = useState(eventToEdit?.category || "general");
  const [image, setImage] = useState(
    eventToEdit?.image || "/images/events/default.jpg"
  );
  const [platform, setPlatform] = useState(eventToEdit?.platform || "");
  const [location, setLocation] = useState(eventToEdit?.location || "");
  const [address, setAddress] = useState(eventToEdit?.address || "");
  const [profile, setProfile] = useState(eventToEdit?.profile || "");
  const [objective, setObjective] = useState(eventToEdit?.objective || "");
  const [duration, setDuration] = useState(eventToEdit?.duration || "");
  const [participants, setParticipants] = useState(
    eventToEdit?.participants || ""
  );
  const [requirements, setRequirements] = useState(
    eventToEdit?.requirements || ""
  );
  const [isActive, setIsActive] = useState(eventToEdit?.isActive ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

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

    setLoading(true);

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
        if (!result.success) {
          setError(result.error || "Ocurrió un error al actualizar el evento.");
          setLoading(false);
          return;
        }
      } else {
        const result = await createEventAction(payload);
        if (!result.success) {
          setError(result.error || "Ocurrió un error al crear el evento.");
          setLoading(false);
          return;
        }
      }

      router.push(`/${locale}/admin/eventos`);
      router.refresh();
    } catch {
      setError("Error inesperado al procesar la solicitud.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/eventos`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">
              {isEditing ? `Editar: ${eventToEdit?.title}` : "Crear Nuevo Evento"}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {isEditing
                ? "Modifica los detalles del evento seleccionado y consulta sus inscripciones."
                : "Llena los detalles para publicar un nuevo evento en la agenda."}
            </p>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>{isEditing ? "Actualizar Evento" : "Guardar Evento"}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-100 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Card variant="elevated" className="p-6">
          <h3 className="mb-4 border-b border-border pb-2 text-lg font-bold text-text-primary">
            Información Básica
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-primary">
                Título del Evento *
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Taller de Inteligencia Artificial para Docentes"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
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

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                <ImageIcon size={16} /> URL de Imagen / Portada
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="/images/events/default.jpg"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-primary">
                Descripción del Evento *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Describe de qué trata el evento..."
              />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <h3 className="mb-4 border-b border-border pb-2 text-lg font-bold text-text-primary">
            Fecha, Horario y Modalidad
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Fecha del Evento *
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Horario
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. 10:00 - 12:00 hrs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Modalidad *
              </label>
              <select
                value={modality}
                onChange={(e) =>
                  setModality(e.target.value as "ONLINE" | "IN_PERSON")
                }
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="ONLINE">En línea</option>
                <option value="IN_PERSON">Presencial</option>
              </select>
            </div>

            {modality === "ONLINE" ? (
              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-medium text-text-primary">
                  Plataforma Virtual
                </label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Ej. Zoom, Google Meet, Teams"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">
                    Lugar / Sede
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Ej. Auditorio Principal"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-text-primary">
                    Dirección Física
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Ej. Av. Universidad 123, Col. Centro"
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <h3 className="mb-4 border-b border-border pb-2 text-lg font-bold text-text-primary">
            Audiencia, Requisitos y Estado
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Perfil del Participante
              </label>
              <input
                type="text"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Docentes, directivos..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Capacidad / Participantes
              </label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. 10 – 15 por capacitador"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Duración
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. 2 horas"
              />
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium text-text-primary">
                Objetivo del Evento
              </label>
              <textarea
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Propósito formativo o metas del evento..."
              />
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium text-text-primary">
                Requisitos
              </label>
              <textarea
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Laptop con conexión a internet..."
              />
            </div>

            <div className="md:col-span-3 pt-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-text-primary">
                  Publicado (Visible en la agenda pública de eventos)
                </span>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}

