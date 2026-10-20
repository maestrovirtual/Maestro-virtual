"use client";

import Image from "next/image";
import { Clock3, Edit2, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { AdminCourse } from "../types/course.types";

interface AdminCourseCardProps {
  course: AdminCourse;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AdminCourseCard({
  course,
  onEdit,
  onDelete,
}: AdminCourseCardProps) {
  const isImageValid = course.image && course.image.trim() !== "";

  return (
    <Card variant="elevated" className="flex flex-col overflow-hidden p-0">
      {/* SECCIÓN DE LA IMAGEN */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {isImageValid ? (
          <Image
            src={course.image}
            alt={course.title}
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
            course.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
          }`}
        >
          {course.isActive ? "Publicado" : "Borrador"}
        </div>

        {course.featured && (
          <div className="absolute top-4 right-4 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            Destacado
          </div>
        )}
      </div>

      {/* CONTENIDO TEXTUAL */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          className="text-lg font-bold tracking-tight text-text-primary line-clamp-1"
          title={course.title}
        >
          {course.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary line-clamp-2 min-h-[2.5rem]">
          {course.shortDescription || course.description}
        </p>

        {/* METADATA */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {course.duration && (
            <div className="flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1 text-xs text-text-secondary border border-border">
              <Clock3 size={13} className="text-slate-500" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.modality && (
            <div className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
              {course.modality}
            </div>
          )}
          {course.type && (
            <div className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {String(course.type)}
            </div>
          )}
        </div>

        {/* ACCIONES DEL ADMIN */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 gap-1.5"
            aria-label={`Editar ${course.title}`}
          >
            <Edit2 size={15} />
            <span>Editar</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            className="flex-1 gap-1.5"
            aria-label={`Eliminar ${course.title}`}
          >
            <Trash2 size={15} />
            <span>Eliminar</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}