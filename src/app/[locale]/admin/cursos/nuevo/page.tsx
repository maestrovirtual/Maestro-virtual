import CourseForm from "@/features/admin/components/CourseForm";
import AdminSidebar from "@/features/admin/components/AdminSidebar";

type NuevoCursoPageProps = {
  params?: Promise<{ locale: string }>;
};

export default async function NuevoCursoPage({
  params,
}: NuevoCursoPageProps = {}) {
  const resolvedParams = params ? await params : undefined;
  const locale = resolvedParams?.locale ?? "es";

  return (
    <div className="flex h-screen bg-background">
      {/* BARRA LATERAL */}
      <AdminSidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8">
        <CourseForm locale={locale} />
      </main>
    </div>
  );
}
