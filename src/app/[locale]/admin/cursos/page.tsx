import AdminCoursesPage from "@/features/admin/components/AdminCoursesView";
import { getAdminCourses } from "@/features/admin/actions/course.actions";
import type { AdminCourse } from "@/features/admin/types/course.types";

export const dynamic = "force-dynamic";

export default async function AdminCursosRoute() {
  let initialCourses: AdminCourse[] = [];
  try {
    initialCourses = await getAdminCourses();
  } catch {
    initialCourses = [];
  }

  return <AdminCoursesPage initialCourses={initialCourses} />;
}