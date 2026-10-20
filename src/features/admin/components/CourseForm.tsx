"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/features/admin/actions/course.actions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CourseForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const result = await createCourse(data);

        if (result.success) {
            router.push("/admin/cursos");
            router.refresh();
        } else {
            setError(result.error || "Ocurrió un error.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl pb-12">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/cursos" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-text-primary">Crear Nuevo Curso</h2>
                        <p className="mt-1 text-sm text-text-secondary">Llena los detalles para publicar un nuevo curso en la plataforma.</p>
                    </div>
                </div>
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                    <Save size={18} />
                    {loading ? "Guardando..." : "Guardar Curso"}
                </Button>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {/* INFORMACIÓN BÁSICA */}
                <Card variant="elevated" className="p-6">
                    <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">Información Básica</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Título del Curso *</label>
                            <input required name="title" type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Ej. Microsoft Excel Avanzado" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Slug (URL amigable) *</label>
                            <input required name="slug" type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Ej. excel-avanzado" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-text-primary">Descripción Corta *</label>
                            <input required name="shortDescription" type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Resumen breve para la tarjeta del curso" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-text-primary">Descripción Completa *</label>
                            <textarea required name="description" rows={4} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Explica detalladamente de qué trata el curso..."></textarea>
                        </div>
                    </div>
                </Card>

                {/* DETALLES ACADÉMICOS */}
                <Card variant="elevated" className="p-6">
                    <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">Detalles Académicos</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Tipo *</label>
                            <select required name="type" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary">
                                <option value="CURSO">Curso</option>
                                <option value="TALLER">Taller</option>
                                <option value="CONFERENCIA">Conferencia</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Etapa *</label>
                            <select required name="stage" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary">
                                <option value="UNO">Etapa 1 (Básico)</option>
                                <option value="DOS">Etapa 2 (Intermedio)</option>
                                <option value="TRES">Etapa 3 (Avanzado)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Modalidad *</label>
                            <input required name="modality" type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Ej. Presencial u Online" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Duración (texto) *</label>
                            <input required name="duration" type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Ej. 10 sesiones" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Núm. Sesiones</label>
                            <input name="sessions" type="number" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Ej. 10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Horas por sesión</label>
                            <input name="hoursPerSession" type="number" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Ej. 2" />
                        </div>
                    </div>
                </Card>

                {/* CONTENIDO Y AUDIENCIA */}
                <Card variant="elevated" className="p-6">
                    <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">Contenido y Audiencia</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Objetivo *</label>
                            <textarea required name="objective" rows={3} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="¿Qué logrará el alumno?"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Público Objetivo *</label>
                            <textarea required name="targetAudience" rows={3} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="¿Para quién es este curso?"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Requisitos *</label>
                            <textarea required name="requirements" rows={2} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Ej. Computadora e internet"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Participantes *</label>
                            <input required name="participants" type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="Ej. 10 - 15 participantes" />
                        </div>
                    </div>
                </Card>

                {/* APARIENCIA Y ESTADO */}
                <Card variant="elevated" className="p-6">
                    <h3 className="mb-4 text-lg font-bold text-text-primary border-b border-border pb-2">Apariencia y Estado</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">URL de Imagen Principal</label>
                            <input name="image" type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="/images/courses/default.jpg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Color Principal (Hex)</label>
                            <input name="color" type="text" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary" placeholder="#00BF63" defaultValue="#00BF63" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary">Patrón de Fondo *</label>
                            <select required name="backgroundPattern" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-primary">
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
                                <input type="checkbox" name="isActive" defaultChecked className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                                <span className="text-sm font-medium text-text-primary">Publicado (Visible para los usuarios)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="featured" className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                                <span className="text-sm font-medium text-text-primary">Destacado (Aparecerá en el inicio)</span>
                            </label>
                        </div>
                    </div>
                </Card>
            </div>
        </form>
    );
}
