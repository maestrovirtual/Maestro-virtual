import { notFound, redirect } from "next/navigation";

import AdminEnrollmentsTable from "@/features/admin/components/AdminEnrollmentsTable";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import CourseForm from "@/features/admin/components/CourseForm";
import type { AdminCourse } from "@/features/admin/types/course.types";
import { getStaffUser } from "@/lib/auth/dal";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

type AdminCourseDetailPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

const STAGE_TO_NUMBER: Record<string, string> = {
  UNO: "1",
  DOS: "2",
  TRES: "3",
};

export default async function AdminCourseDetailPage({
  params,
}: AdminCourseDetailPageProps) {
  const { locale, id } = await params;

  const staff = await getStaffUser();
  if (!staff) {
    redirect(`/${locale}/staff/login`);
  }

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    notFound();
  }

  const courseToEdit: AdminCourse = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortDescription: course.shortDescription,
    description: course.description,
    image: course.image,
    icon: course.icon,
    video: course.video,
    color: course.color,
    type: course.type,
    stage: STAGE_TO_NUMBER[course.stage] ?? "1",
    categories: course.categories,
    skills: course.skills,
    duration: course.duration,
    sessions: course.sessions,
    hoursPerSession: course.hoursPerSession,
    modality: course.modality,
    participants: course.participants,
    targetAudience: course.targetAudience,
    objective: course.objective,
    requirements: course.requirements,
    backgroundPattern: course.backgroundPattern,
    featured: course.featured,
    featuredOrder: course.featuredOrder,
    clickable: course.clickable,
    isActive: course.isActive,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <CourseForm courseToEdit={courseToEdit} locale={locale} />

        <div className="mx-auto max-w-4xl pb-12">
          <AdminEnrollmentsTable courseId={course.id} />
        </div>
      </main>
    </div>
  );
}

