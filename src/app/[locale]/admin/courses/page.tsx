import AdminCoursesPage from "@/features/admin/components/AdminCoursesView";
import { getAdminCourses } from "@/features/admin/actions/course.actions";
import type { AdminCourse } from "@/features/admin/types/course.types";

export const dynamic = "force-dynamic";

type AdminCoursesRouteProps = {
  params?: Promise<{ locale: string }>;
};

export default async function AdminCoursesRoute({
  params,
}: AdminCoursesRouteProps = {}) {
  const resolvedParams = params ? await params : undefined;
  const locale = resolvedParams?.locale ?? "es";

  let initialCourses: AdminCourse[] = [];
  try {
    initialCourses = await getAdminCourses();
  } catch {
    initialCourses = [];
  }

  return <AdminCoursesPage initialCourses={initialCourses} locale={locale} />;
}
