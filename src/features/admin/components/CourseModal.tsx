"use client";

import { useState } from "react";
import { X, Save, Loader2, Image as ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createCourseAction, updateCourseAction } from "@/features/admin/actions/course.actions";
import type { AdminCourse, CourseFormData } from "../types/course.types";

interface CourseModalProps {
  isOpen: boolean;
  courseToEdit?: AdminCourse | null;
  onClose: () => void;
  onSaved: (course: AdminCourse) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CourseModal({
  isOpen,
  courseToEdit,
  onClose,
  onSaved,
}: CourseModalProps) {
  if (!isOpen) return null;

  return (
    <CourseModalDialog
      key={courseToEdit ? courseToEdit.id : "new-course"}
      courseToEdit={courseToEdit}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function CourseModalDialog({
  courseToEdit,
  onClose,
  onSaved,
}: {
  courseToEdit?: AdminCourse | null;
  onClose: () => void;
  onSaved: (course: AdminCourse) => void;
}) {
  const isEditing = Boolean(courseToEdit);

  // Form states initialized directly from courseToEdit (reset via key on mount)
  const [title, setTitle] = useState(courseToEdit?.title || "");
  const [slug, setSlug] = useState(courseToEdit?.slug || "");
  const [isSlugManuallyModified, setIsSlugManuallyModified] = useState(Boolean(courseToEdit));
  const [shortDescription, setShortDescription] = useState(courseToEdit?.shortDescription || "");
  const [description, setDescription] = useState(courseToEdit?.description || "");
  const [duration, setDuration] = useState(courseToEdit?.duration || "10 hrs");
  const [modality, setModality] = useState(courseToEdit?.modality || "Presencial");
  const [categories, setCategories] = useState(
    Array.isArray(courseToEdit?.categories)
      ? courseToEdit.categories.join(", ")
      : courseToEdit?.categories || "Tecnología, Productividad"
  );
  const [skills, setSkills] = useState(
    Array.isArray(courseToEdit?.skills)
      ? courseToEdit.skills.join(", ")
      : courseToEdit?.skills || ""
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
  const [sessions, setSessions] = useState(
    courseToEdit?.sessions != null ? String(courseToEdit.sessions) : ""
  );
  const [hoursPerSession, setHoursPerSession] = useState(
    courseToEdit?.hoursPerSession != null ? String(courseToEdit.hoursPerSession) : ""
  );
  const [participants, setParticipants] = useState(
    courseToEdit?.participants || "10 - 15 participantes"
  );
  const [targetAudience, setTargetAudience] = useState(
    courseToEdit?.targetAudience || "Público en general"
  );
  const [objective, setObjective] = useState(courseToEdit?.objective || "");
  const [requirements, setRequirements] = useState(
    courseToEdit?.requirements || "Ninguno"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Title change with automatic slug generation
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
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("El título del curso es obligatorio.");
      return;
    }
    if (!slug.trim()) {
      setError("El slug (URL amigable) es obligatorio.");
      return;
    }
    if (!shortDescription.trim()) {
      setError("La descripción corta es obligatoria.");
      return;
    }
    if (!description.trim()) {
      setError("La descripción completa es obligatoria.");
      return;
    }
    if (!duration.trim()) {
      setError("La duración es obligatoria.");
      return;
    }

    setIsSubmitting(true);

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
        if (!result.success || !result.data) {
          setError(result.error || "Error al actualizar el curso.");
          setIsSubmitting(false);
          return;
        }
        onSaved(result.data);
      } else {
        const result = await createCourseAction(payload);
        if (!result.success || !result.data) {
          setError(result.error || "Error al crear el curso.");
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
      aria-labelledby="course-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-surface shadow-2xl">
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id="course-modal-title" className="text-xl font-bold tracking-tight text-text-primary">
              {isEditing ? `Editar Curso: ${courseToEdit?.title}` : "Crear Nuevo Curso"}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {isEditing
                ? "Modifica los campos que necesites y guarda los cambios."
                : "Ingresa los detalles para publicar un nuevo curso en el catálogo."}
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Título del Curso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Ej. Microsoft Excel Avanzado"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Slug (URL amigable) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-text-secondary">Autogenerado</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="ej. microsoft-excel-avanzado"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Descripción Corta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Breve resumen que se mostrará en las tarjetas de cursos"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Descripción Completa <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalla todo lo referente al contenido y aprendizaje del curso..."
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>
              </div>
            </Card>

            {/* SECCIÓN 2: DETALLES ACADÉMICOS Y MODALIDAD */}
            <Card variant="default" className="p-5">
              <h3 className="mb-4 text-base font-bold text-text-primary border-b border-border pb-2">
                Academia y Modalidad
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Tipo de Formación <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="CURSO">Curso</option>
                    <option value="TALLER">Taller</option>
                    <option value="CONFERENCIA">Conferencia</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Etapa / Nivel <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="1">Etapa 1 (Básico)</option>
                    <option value="2">Etapa 2 (Intermedio)</option>
                    <option value="3">Etapa 3 (Avanzado)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Modalidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    placeholder="Ej. Presencial, En línea (Zoom)"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Duración <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ej. 10 hrs o 5 semanas"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Núm. Sesiones
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sessions}
                    onChange={(e) => setSessions(e.target.value)}
                    placeholder="Ej. 10"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Horas por sesión
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={hoursPerSession}
                    onChange={(e) => setHoursPerSession(e.target.value)}
                    placeholder="Ej. 2"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Categorías (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    placeholder="Ej. Tecnología, Productividad, Ofimática"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Habilidades (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Ej. Fórmulas, Tablas dinámicas"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </Card>

            {/* SECCIÓN 3: PÚBLICO Y OBJETIVO */}
            <Card variant="default" className="p-5">
              <h3 className="mb-4 text-base font-bold text-text-primary border-b border-border pb-2">
                Audiencia y Requisitos
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Objetivo
                  </label>
                  <textarea
                    rows={2}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="¿Qué competencia o habilidad logrará el alumno?"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Público Objetivo
                  </label>
                  <textarea
                    rows={2}
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="¿A quién está orientado este curso?"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Requisitos
                  </label>
                  <input
                    type="text"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Ej. Computadora y conexión a internet"
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
                    placeholder="Ej. 10 - 15 participantes"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </Card>

            {/* SECCIÓN 4: APARIENCIA Y ESTADO */}
            <Card variant="default" className="p-5">
              <h3 className="mb-4 text-base font-bold text-text-primary border-b border-border pb-2">
                Apariencia y Publicación
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <ImageIcon size={14} /> URL de Imagen Principal
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Ej. /images/cursos/excel.jpg o https://..."
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Color Representativo (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Patrón de Fondo
                  </label>
                  <select
                    value={backgroundPattern}
                    onChange={(e) => setBackgroundPattern(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
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

                {/* ESTADO PUBLICADO / BORRADOR */}
                <div className="rounded-xl border border-border bg-background p-4 flex flex-col justify-center">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-semibold text-text-primary">
                        {isActive ? "Publicado (Visible en el catálogo)" : "Borrador (Oculto para el público)"}
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {isActive
                          ? "Los usuarios podrán ver y registrarse en este curso."
                          : "Solo los administradores pueden ver este curso en el panel."}
                      </p>
                    </div>
                  </label>
                </div>

                {/* DESTACADO */}
                <div className="rounded-xl border border-border bg-background p-4 flex flex-col justify-center">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-semibold text-text-primary">
                        Destacar curso
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Aparecerá en la sección de cursos destacados de la página de inicio.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* FOOTER DEL MODAL */}
          <div className="flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
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
                  <span>{isEditing ? "Actualizando..." : "Guardando..."}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? "Guardar Cambios" : "Guardar Curso"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
