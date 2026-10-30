"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourseAction, updateCourseAction } from "@/features/admin/actions/course.actions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Save, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import type { AdminCourse, CourseFormData } from "../types/course.types";

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
  const [image, setImage] = useState(courseToEdit?.image || "/images/courses/default.jpg");
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

    const payload: Partial<CourseFormData> = {
      title: title.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      duration: duration.trim(),
      modality: modality.trim(),
      categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      type,
      stage,
      isActive,
      featured,
      image: image.trim() || "/images/courses/default.jpg",
      color: color.trim() || "#2563EB",
      backgroundPattern,
      sessions: sessions ? Number(sessions) : null,
      hoursPerSession: hoursPerSession ? Number(hoursPerSession) : null,
      participants: participants.trim() || "10 - 15 participantes",
      targetAudience: targetAudience.trim() || "Público en general",
      objective: objective.trim() || "",
      requirements: requirements.trim() || "Ninguno",
      clickable: true,
    };

    try {
      if (isEditing && courseToEdit) {
        const result = await updateCourseAction(courseToEdit.id, payload);
        if (!result.success) {
          setError(result.error || "Ocurrió un error al actualizar.");
          setLoading(false);
          return;
        }
      } else {
        const result = await createCourseAction(payload);
        if (!result.success) {
          setError(result.error || "Ocurrió un error al crear.");
          setLoading(false);
          return;
        }
      }

      router.push(`/${locale}/admin/cursos`);
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
            href={`/${locale}/admin/cursos`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-border"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">
              {isEditing ? `Editar: ${courseToEdit?.title}` : "Crear Nuevo Curso"}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {isEditing
                ? "Modifica los detalles del curso seleccionado."
                : "Llena los detalles para publicar un nuevo curso en la plataforma."}
            </p>
          </div>
        </div>
        <Button type="submit" variant="primary" size="lg" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>{isEditing ? "Actualizar Curso" : "Guardar Curso"}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* INFORMACIÓN BÁSICA */}
        <Card variant="elevated" className="p-6">
          <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            Información Básica
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Título del Curso *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Microsoft Excel Avanzado"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Slug (URL amigable) *</label>
              <input
                required
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-mono text-xs outline-none focus:border-primary"
                placeholder="Ej. excel-avanzado"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-primary">Descripción Corta *</label>
              <input
                required
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Resumen breve para la tarjeta del curso"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-primary">Descripción Completa *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Explica detalladamente de qué trata el curso..."
              />
            </div>
          </div>
        </Card>

        {/* DETALLES ACADÉMICOS */}
        <Card variant="elevated" className="p-6">
          <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">
            Detalles Académicos
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Tipo *</label>
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
              <label className="text-sm font-medium text-text-primary">Etapa *</label>
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
              <label className="text-sm font-medium text-text-primary">Modalidad *</label>
              <input
                required
                type="text"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Presencial u Online"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Duración (texto) *</label>
              <input
                required
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. 10 sesiones"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Núm. Sesiones</label>
              <input
                type="number"
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. 10"
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
              <label className="text-sm font-medium text-text-primary">Categorías (separadas por comas)</label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ej. Tecnología, Productividad"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Habilidades (separadas por comas)</label>
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                <ImageIcon size={16} /> URL de Imagen Principal
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="/images/courses/default.jpg"
              />
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
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-text-primary">
                  Publicado (Visible para los usuarios)
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-text-primary">
                  Destacado (Aparecerá en el inicio)
                </span>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}
