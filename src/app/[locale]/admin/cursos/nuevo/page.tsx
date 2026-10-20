import CourseForm from "@/features/admin/components/CourseForm";
import AdminSidebar from "@/features/admin/components/AdminSidebar";

export default function NuevoCursoPage() {
    return (
        <div className="flex h-screen bg-background">
            {/* BARRA LATERAL */}
            <AdminSidebar />

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 overflow-y-auto p-8">
                <CourseForm />
            </main>
        </div>
    );
}
