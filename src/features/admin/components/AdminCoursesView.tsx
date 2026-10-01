"use client";

import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import AdminCourseCard from '@/features/admin/components/AdminCourseCard';
import AdminSidebar from '@/features/admin/components/AdminSidebar';

export default function AdminCoursesPage() {
    // Datos mockeados temporales para ver el diseño (Eduardo los conectará a Prisma luego)
    const mockCourses: any[] = [
        {
            id: "1",
            title: "Aprendiendo a usar las tecnologías",
            shortDescription: "Conoce herramientas tecnológicas básicas para mejorar tu comunicación digital.",
            image: "", // Dejamos vacío para probar el "Sin Imagen"
            isActive: true,
            duration: "10 hrs",
            modality: "Presencial"
        },
        {
            id: "2",
            title: "Microsoft Excel Avanzado",
            shortDescription: "Domina las hojas de cálculo para organizar tu información como un profesional.",
            image: "/images/cursos/excel.jpg", // Asume que existe una imagen
            isActive: false, // Borrador
            duration: "15 hrs",
            modality: "En línea (Zoom)"
        }
    ];

    return (
        <div className="flex h-screen bg-background">
            {/* BARRA LATERAL */}
            <AdminSidebar />

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 overflow-y-auto p-8">

                {/* HEADER DE LA PÁGINA */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-text-primary">Administrar Cursos</h2>
                        <p className="mt-1 text-sm text-text-secondary">Crea, edita o elimina los cursos disponibles en la plataforma.</p>
                    </div>

                    <Button variant="primary" size="lg">
                        <Plus size={18} />
                        Crear Nuevo Curso
                    </Button>
                </div>

                {/* CUADRÍCULA DE CURSOS */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {mockCourses.map((course) => (
                        <AdminCourseCard
                            key={course.id}
                            course={course}
                            onEdit={() => console.log(`Editar curso ${course.id}`)}
                            onDelete={() => console.log(`Eliminar curso ${course.id}`)}
                        />
                    ))}
                </div>

            </main>
        </div>
    );
}