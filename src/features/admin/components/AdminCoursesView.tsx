"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen } from "lucide-react";
import Button from "@/components/ui/Button";
import AdminCourseCard from "@/features/admin/components/AdminCourseCard";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import CourseModal from "@/features/admin/components/CourseModal";
import DeleteConfirmModal from "@/features/admin/components/DeleteConfirmModal";
import type { AdminCourse } from "../types/course.types";

interface AdminCoursesPageProps {
  initialCourses?: AdminCourse[];
}

export default function AdminCoursesPage({ initialCourses = [] }: AdminCoursesPageProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<AdminCourse[]>(initialCourses);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<AdminCourse | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<AdminCourse | null>(null);

  // Sync if initialCourses changes
  const [prevInitialCourses, setPrevInitialCourses] = useState(initialCourses);
  if (initialCourses !== prevInitialCourses) {
    setPrevInitialCourses(initialCourses);
    setCourses(initialCourses);
  }

  // Fetch fallback if needed
  useEffect(() => {
    if (initialCourses.length === 0) {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/courses?all=true");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              setCourses(data);
            }
          }
        } catch {
          // Keep empty or current state
        } finally {
          setLoading(false);
        }
      };

      fetchCourses();
    }
  }, [initialCourses.length]);

  const handleOpenCreate = () => {
    setCourseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: AdminCourse) => {
    setCourseToEdit(course);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (course: AdminCourse) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleCourseSaved = (savedCourse: AdminCourse) => {
    setCourses((prev) => {
      const exists = prev.some((c) => c.id === savedCourse.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCourse.id ? savedCourse : c));
      }
      return [savedCourse, ...prev];
    });
    router.refresh();
  };

  const handleCourseDeleted = (deletedCourseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== deletedCourseId));
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* BARRA LATERAL */}
      <AdminSidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* HEADER DE LA PÁGINA */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">
              Administrar Cursos
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Crea, edita o elimina los cursos disponibles en la plataforma.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleOpenCreate}
            className="self-start sm:self-auto gap-2 shadow-sm"
          >
            <Plus size={18} />
            Crear Nuevo Curso
          </Button>
        </div>

        {/* CUADRÍCULA DE CURSOS */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <AdminCourseCard
                key={course.id}
                course={course}
                onEdit={() => handleOpenEdit(course)}
                onDelete={() => handleOpenDelete(course)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center bg-surface">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-bold text-text-primary">No hay cursos registrados</h3>
            <p className="mt-1 text-sm text-text-secondary max-w-sm">
              Comienza agregando el primer curso para que aparezca en el catálogo y los usuarios puedan inscribirse.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreate}
              className="mt-6 gap-2"
            >
              <Plus size={16} />
              Crear Nuevo Curso
            </Button>
          </div>
        )}

        {/* MODAL PARA CREAR O EDITAR */}
        <CourseModal
          isOpen={isModalOpen}
          courseToEdit={courseToEdit}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleCourseSaved}
        />

        {/* MODAL PARA CONFIRMAR ELIMINACIÓN */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          course={courseToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={handleCourseDeleted}
        />
      </main>
    </div>
  );
}