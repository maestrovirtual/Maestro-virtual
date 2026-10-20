"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import type { AdminCourse } from "../types/course.types";
import type { AdminEvent } from "../types/event.types";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  course?: AdminCourse | null;
  event?: AdminEvent | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteConfirmModal({
  isOpen,
  course,
  event,
  onClose,
  onDeleted,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetItem = event || course;
  if (!isOpen || !targetItem) return null;

  const isEvent = Boolean(event);
  const itemTypeLabel = isEvent ? "evento" : "curso";
  const itemTypeLabelCapitalized = isEvent ? "Evento" : "Curso";

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      if (isEvent && event) {
        // 1. Intentamos vía Server Action de eventos
        const { deleteEventAction } = await import("@/features/admin/actions/event.actions");
        const actionResult = await deleteEventAction(event.id);

        if (!actionResult.success) {
          // 2. Si falla la Server Action, intentamos vía Endpoint REST
          const response = await fetch(`/api/events/${event.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || actionResult.error || "No se pudo eliminar el evento."
            );
          }
        }

        onDeleted(event.id);
        onClose();
      } else if (course) {
        // 1. Intentamos vía Server Action de cursos
        const { deleteCourseAction } = await import("@/features/admin/actions/course.actions");
        const actionResult = await deleteCourseAction(course.id);

        if (!actionResult.success) {
          // 2. Si falla la Server Action, intentamos vía Endpoint REST
          const response = await fetch(`/api/courses/${course.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || actionResult.error || "No se pudo eliminar el curso."
            );
          }
        }

        onDeleted(course.id);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error inesperado al eliminar el ${itemTypeLabel}.`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle size={24} />
          </div>

          <div className="flex-1">
            <h3
              id="delete-dialog-title"
              className="text-lg font-bold tracking-tight text-text-primary"
            >
              ¿Eliminar {itemTypeLabel}?
            </h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              ¿Estás seguro de que deseas eliminar{" "}
              <strong className="text-text-primary font-semibold">
                &ldquo;{targetItem.title}&rdquo;
              </strong>
              ? Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              `Eliminar ${itemTypeLabelCapitalized}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
