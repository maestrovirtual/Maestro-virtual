"use client";

import Image from "next/image";
import { Clock3, Edit2, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// Importas el curso base
import type { Course } from "../../courses/data/courses";

// Creas un nuevo tipo que hereda de Course y le suma lo que falta
type AdminCourse = Course & {
    isActive?: boolean;
    modality?: string;
};

// Usas AdminCourse en lugar de Course
export default function AdminCourseCard({ course, onEdit, onDelete }: { course: AdminCourse, onEdit: () => void, onDelete: () => void }) {
    return (
        <Card
            variant="elevated"
        >
            {/* SECCIÓN DE LA IMAGEN */}
            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                {course.image ? (
                    <Image src={course.image} alt={course.title} fill className="object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">Sin Imagen</div>
                )}

                {/* ETIQUETA DE ESTADO (Publicado/Borrador) */}
                <div className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${course.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {course.isActive ? 'Publicado' : 'Borrador'}
                </div>
            </div>

            {/* CONTENIDO TEXTUAL */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-xl font-bold tracking-tight text-text-primary truncate">{course.title}</h3>
                <p className="mt-2 text-sm leading-5 text-text-secondary line-clamp-2">{course.shortDescription}</p>

                {/* METADATA */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs">
                        <Clock3 size={14} className="text-slate-500" />
                        {course.duration}
                    </div>
                    <div className="rounded-full border border-border px-2.5 py-1 text-xs text-slate-500">
                        {course.modality}
                    </div>
                </div>

                {/* ACCIONES DEL ADMIN */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                        <Edit2 size={16} /> Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={onDelete} className="flex-1">
                        <Trash2 size={16} /> Eliminar
                    </Button>
                </div>
            </div>
        </Card>
    );
}