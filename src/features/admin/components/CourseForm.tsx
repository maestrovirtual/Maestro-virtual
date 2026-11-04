"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createCourseAction, updateCourseAction } from "@/features/admin/actions/course.actions";
import { validateImageFile } from "@/lib/storage";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import Link from "next/link";
import type { AdminCourse } from "../types/course.types";

interface CourseFormProps {
  courseToEdit?: AdminCourse | null;
  locale?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CourseForm({ courseToEdit, locale = "es" }: CourseFormProps) {
  const router = useRouter();
  const isEditing = Boolean(courseToEdit);

  // Form states
  const [title, setTitle] = useState(courseToEdit?.title || "");
  const [slug, setSlug] = useState(courseToEdit?.slug || "");
  const [isSlugManuallyModified, setIsSlugManuallyModified] = useState(Boolean(courseToEdit));
  const [shortDescription, setShortDescription] = useState(courseToEdit?.shortDescription || "");
  const [description, setDescription] = useState(courseToEdit?.description || "");
  const [duration, setDuration] = useState(courseToEdit?.duration || "10 hrs");
  const [modality, setModality] = useState(courseToEdit?.modality || "Presencial");
  const [categories, setCategories] = useState(
    Array.isArray(courseToEdit?.categories) ? courseToEdit.categories.join(", ") : "Tecnología, Productividad"
  );
  const [skills, setSkills] = useState(
    Array.isArray(courseToEdit?.skills) ? courseToEdit.skills.join(", ") : ""
  );
  const [type, setType] = useState(String(courseToEdit?.type || "CURSO").toUpperCase());
  const [stage, setStage] = useState(String(courseToEdit?.stage || "1"));
  const [isActive, setIsActive] = useState(courseToEdit?.isActive ?? true);
  const [featured, setFeatured] = useState(courseToEdit?.featured ?? false);

  // Image upload states
  const [image, setImage] = useState(courseToEdit?.image || "/images/courses/default.jpg");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(courseToEdit?.image || null);

  const [color, setColor] = useState(courseToEdit?.color || "#2563EB");
  const [backgroundPattern, setBackgroundPattern] = useState(
    String(courseToEdit?.backgroundPattern || "GRID").toUpperCase()
  );
  const [sessions, setSessions] = useState(courseToEdit?.sessions != null ? String(courseToEdit.sessions) : "");
  const [hoursPerSession, setHoursPerSession] = useState(
    courseToEdit?.hoursPerSession != null ? String(courseToEdit.hoursPerSession) : ""
  );
  const [participants, setParticipants] = useState(courseToEdit?.participants || "10 - 15 participantes");
  const [targetAudience, setTargetAudience] = useState(courseToEdit?.targetAudience || "Público en general");
  const [objective, setObjective] = useState(courseToEdit?.objective || "");
  const [requirements, setRequirements] = useState(courseToEdit?.requirements || "Ninguno");

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

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "El archivo seleccionado no es válido.");
      e.target.value = "";
      return;
    }

    setError(null);
    setImageFile(file);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl(courseToEdit?.image || null);
    setImage(courseToEdit?.image || "/images/courses/default.jpg");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyModified) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(slugify(val));
    setIsSlugManuallyModified(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title.trim()) {
      setError("El título del curso es obligatorio.");
      setLoading(false);
      return;
    }
    if (!slug.trim()) {
      setError("El slug (URL amigable) es obligatorio.");
      setLoading(false);
      return;
    }
    if (!shortDescription.trim()) {
      setError("La descripción corta es obligatoria.");
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      setError("La descripción completa es obligatoria.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("slug", slug.trim());
    formData.append("shortDescription", shortDescription.trim());
    formData.append("description", description.trim());
    formData.append("duration", duration.trim());
    formData.append("modality", modality.trim());
    formData.append("type", type);
    formData.append("stage", stage);
    formData.append("color", color.trim() || "#2563EB");
    formData.append("backgroundPattern", backgroundPattern);
    formData.append("participants", participants.trim() || "10 - 15 participantes");
    formData.append("targetAudience", targetAudience.trim() || "Público en general");
    formData.append("objective", objective.trim() || "");
    formData.append("requirements", requirements.trim() || "Ninguno");
    formData.append("isActive", String(isActive));
    formData.append("featured", String(featured));
    formData.append("clickable", "true");

    if (categories.trim()) formData.append("categories", categories.trim());
    if (skills.trim()) formData.append("skills", skills.trim());
    if (sessions) formData.append("sessions", sessions);
    if (hoursPerSession) formData.append("hoursPerSession", hoursPerSession);

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (image) {
      formData.append("imageUrl", image);
    }

    try {
      if (isEditing && courseToEdit) {
        const result = await updateCourseAction(courseToEdit.id, formData);
        if (!result.success) {
          setError(result.error || "Error al actualizar curso.");
          setLoading(false);
          return;
        }
      } else {
        const result = await createCourseAction(formData);
        if (!result.success) {
          setError(result.error || "Error al crear curso.");
          setLoading(false);
          return;
        }
      }
      router.push(`/${locale}/admin/cursos`);
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/cursos`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {isEditing ? `Editar: ${courseToEdit?.title}` : "Crear Nuevo Curso"}
            </h1>
            <p className="text-sm text-text-secondary">
              {isEditing ? "Modifica los detalles del curso" : "Completa la información del curso"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INFORMACIÓN BÁSICA */}
        <Card variant="elevated" className="p-6">
          <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            Información Básica
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Título del Curso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Excel Básico"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary font-mono text-xs"
                placeholder="excel-basico"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-primary">
                Descripción Corta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Breve resumen del curso"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-primary">
                Descripción Completa <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Detalle de todo el temario y aprendizaje..."
              />
            </div>
          </div>
        </Card>

        {/* MODALIDAD Y DURACIÓN */}
        <Card variant="elevated" className="p-6">
          <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            Academia y Horarios
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="CURSO">Curso</option>
                <option value="TALLER">Taller</option>
                <option value="CONFERENCIA">Conferencia</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Etapa</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="1">Etapa 1 (Básico)</option>
                <option value="2">Etapa 2 (Intermedio)</option>
                <option value="3">Etapa 3 (Avanzado)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Modalidad</label>
              <input
                type="text"
                required
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Presencial"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Duración</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. 10 hrs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Sesiones</label>
              <input
                type="number"
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. 5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Horas por sesión</label>
              <input
                type="number"
                value={hoursPerSession}
                onChange={(e) => setHoursPerSession(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. 2"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-primary">Categorías</label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Separadas por comas"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Habilidades</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Excel, Fórmulas"
              />
            </div>
          </div>
        </Card>

        {/* CONTENIDO Y AUDIENCIA */}
        <Card variant="elevated" className="p-6">
          <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            Contenido y Audiencia
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Objetivo</label>
              <textarea
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="¿Qué logrará el alumno?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Público Objetivo</label>
              <textarea
                rows={3}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="¿Para quién es este curso?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Requisitos</label>
              <textarea
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Computadora e internet"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Participantes</label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. 10 - 15 participantes"
              />
            </div>
          </div>
        </Card>

        {/* APARIENCIA Y ESTADO */}
        <Card variant="elevated" className="p-6">
          <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            Apariencia y Estado
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* SUBIDA DE IMAGEN CON PREVIEW */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                <ImageIcon size={16} /> Portada / Imagen Principal del Curso
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-dashed border-border bg-slate-50/60 p-4 dark:bg-slate-900/30">
                {previewUrl ? (
                  <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-lg border border-border bg-slate-100 shadow-xs dark:bg-slate-800 flex items-center justify-center p-1">
                    <Image
                      src={previewUrl}
                      alt="Vista previa de portada del curso"
                      fill
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                    {imageFile && (
                      <span className="absolute bottom-1 right-1 rounded bg-primary/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                        Nueva
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex h-28 w-44 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <ImageIcon size={28} />
                    <span className="mt-1 text-[11px]">Sin imagen</span>
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="course-form-cover-file"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-text-primary shadow-xs transition-colors hover:bg-slate-50 hover:text-primary dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      <Upload size={14} />
                      <span>{previewUrl ? "Cambiar imagen" : "Subir imagen"}</span>
                    </label>
                    <input
                      id="course-form-cover-file"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading}
                      className="sr-only"
                    />

                    {imageFile && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-text-secondary">
                    {imageFile ? (
                      <span className="font-medium text-primary">
                        Archivo seleccionado: {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                      </span>
                    ) : previewUrl ? (
                      <span>Imagen asignada actualmente. Puedes seleccionar un nuevo archivo desde tu computadora para actualizarla.</span>
                    ) : (
                      <span>Formatos admitidos: JPG, PNG, WebP o AVIF. Tamaño máximo: 5MB.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Color Principal (Hex)</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary font-mono text-xs uppercase"
                placeholder="#2563EB"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Patrón de Fondo</label>
              <select
                value={backgroundPattern}
                onChange={(e) => setBackgroundPattern(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="GRID">Grid</option>
                <option value="WAVES">Waves</option>
                <option value="SHAPES">Shapes</option>
                <option value="CARDS">Cards</option>
                <option value="SLIDES">Slides</option>
                <option value="GROWTH">Growth</option>
                <option value="CHAT">Chat</option>
              </select>
            </div>

            <div className="flex flex-col gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-text-primary">
                  Publicado (Visible en el catálogo)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-text-primary">Destacado</span>
              </label>
            </div>
          </div>
        </Card>

        {/* ACCIONES */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/${locale}/admin/cursos`}
            className="rounded-xl border border-border bg-surface px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-background hover:text-text-primary"
          >
            Cancelar
          </Link>
          <Button type="submit" variant="primary" size="md" disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{isEditing ? "Actualizar Curso" : "Guardar Curso"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
