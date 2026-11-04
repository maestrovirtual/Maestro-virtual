"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Loader2, Save, Upload, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  createEventAction,
  updateEventAction,
} from "@/features/admin/actions/event.actions";
import type { AdminEvent } from "../types/event.types";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(eventToEdit?.image || null);

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

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo seleccionado debe ser una imagen válida (JPG, PNG, WebP o AVIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB de tamaño.");
      return;
    }

    setError(null);
    setImageFile(file);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl(eventToEdit?.image || null);
    setImage(eventToEdit?.image || "/images/events/default.jpg");
  };

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

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("date", date);
    if (time.trim()) formData.append("time", time.trim());
    formData.append("modality", modality);
    formData.append("category", category.trim() || "general");
    if (modality === "ONLINE" && platform.trim()) formData.append("platform", platform.trim());
    if (modality === "IN_PERSON") {
      if (location.trim()) formData.append("location", location.trim());
      if (address.trim()) formData.append("address", address.trim());
    }
    if (profile.trim()) formData.append("profile", profile.trim());
    if (objective.trim()) formData.append("objective", objective.trim());
    if (duration.trim()) formData.append("duration", duration.trim());
    if (participants.trim()) formData.append("participants", participants.trim());
    if (requirements.trim()) formData.append("requirements", requirements.trim());
    formData.append("isActive", String(isActive));

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (image) {
      formData.append("imageUrl", image);
    }

    Object.assign(formData, {
      title: title.trim(),
      description: description.trim(),
      date,
      time: time.trim() || undefined,
      modality,
      category: category.trim() || "general",
      image: imageFile ? imageFile.name : image,
      isActive,
    });

    try {
      if (isEditing && eventToEdit) {
        const result = await updateEventAction(eventToEdit.id, formData);
        if (!result.success) {
          setError(result.error || "Ocurrió un error al actualizar el evento.");
          setLoading(false);
          return;
        }
      } else {
        const result = await createEventAction(formData);
        if (!result.success) {
          setError(result.error || "Ocurrió un error al crear el evento.");
          setLoading(false);
          return;
        }
      }

      router.push(`/${locale}/admin/eventos`);
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/eventos`}
          className="rounded-lg border border-border p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isEditing ? `Editar Evento: ${eventToEdit?.title}` : "Crear Nuevo Evento"}
          </h1>
          <p className="text-sm text-text-secondary">
            {isEditing
              ? "Modifica los campos necesarios para actualizar la información del evento."
              : "Completa la información requerida para publicar un nuevo evento en la plataforma."}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
        <Card variant="default" className="p-6">
          <h2 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            1. Información Básica
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-primary">
                Título del Evento *
              </label>
              <input
                type="text"
                required
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

            {/* SUBIDA DE IMAGEN CON PREVIEW */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                <ImageIcon size={16} /> Portada del Evento
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-dashed border-border bg-slate-50/60 p-4 dark:bg-slate-900/30">
                {previewUrl ? (
                  <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-slate-100 shadow-xs dark:bg-slate-800">
                    <Image
                      src={previewUrl}
                      alt="Vista previa de portada"
                      fill
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                    {imageFile && (
                      <span className="absolute bottom-1 right-1 rounded bg-primary/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                        Nueva
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex h-24 w-36 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <ImageIcon size={26} />
                    <span className="mt-1 text-[11px] font-medium">Sin imagen</span>
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="eventform-cover-file"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-text-primary shadow-xs transition-colors hover:bg-slate-50 hover:text-primary dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      <Upload size={14} />
                      <span>{previewUrl ? "Cambiar imagen" : "Subir imagen"}</span>
                    </label>
                    <input
                      id="eventform-cover-file"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />

                    {imageFile && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={13} />
                        Quitar
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-text-secondary">
                    {imageFile ? (
                      <span className="font-medium text-primary">
                        Archivo seleccionado: {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                      </span>
                    ) : previewUrl ? (
                      <span>Imagen asignada actualmente. Puedes seleccionar un nuevo archivo para actualizarla.</span>
                    ) : (
                      <span>Formatos admitidos: JPG, PNG, WebP o AVIF. Tamaño máximo: 5MB.</span>
                    )}
                  </div>
                </div>
              </div>
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

        {/* SECCIÓN 2: FECHA, HORARIO Y MODALIDAD */}
        <Card variant="default" className="p-6">
          <h2 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            2. Fecha, Horario y Modalidad
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Fecha del Evento *
              </label>
              <input
                type="date"
                required
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
                placeholder="Ej. 10:00 - 12:00 hrs"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
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
                <option value="ONLINE">En Línea</option>
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
                  placeholder="Ej. Zoom, Google Meet, Microsoft Teams"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-text-primary">
                    Lugar / Sede
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej. Salón Comunitario"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-text-primary">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Calle Principal 123, Ciudad"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* SECCIÓN 3: PÚBLICO Y OBJETIVOS */}
        <Card variant="default" className="p-6">
          <h2 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            3. Audiencia y Objetivos
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Perfil de los Asistentes
              </label>
              <input
                type="text"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="Ej. Docentes, Estudiantes, Público General"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Objetivo del Evento
              </label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Ej. Aprender a usar herramientas digitales"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </Card>

        {/* SECCIÓN 4: DETALLES ADICIONALES */}
        <Card variant="default" className="p-6">
          <h2 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            4. Información Adicional
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Duración
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ej. 2 horas"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Participantes
              </label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Ej. Máximo 30 personas"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Requisitos
              </label>
              <input
                type="text"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Ej. Computadora con internet"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </Card>

        {/* SECCIÓN 5: ESTADO DE PUBLICACIÓN */}
        <Card variant="default" className="p-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-text-primary cursor-pointer select-none"
            >
              Publicado (Visible en la agenda pública de eventos)
            </label>
          </div>
          <p className="mt-1 text-xs text-text-secondary ml-8">
            Si está desactivado, el evento se guardará en estado «Borrador» y solo será visible en el panel administrativo.
          </p>
        </Card>

        {/* BOTONES */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/${locale}/admin/eventos`}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            Cancelar
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{isEditing ? "Actualizar Evento" : "Crear Evento"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
