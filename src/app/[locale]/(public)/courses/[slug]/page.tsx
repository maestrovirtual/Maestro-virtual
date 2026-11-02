import { notFound } from "next/navigation";

// 1. Importamos los datos locales únicamente como Plan B (Red de Seguridad)
import { courses as mockCourses, type Course } from "@/features/courses/data/courses";
import { getCurrentUser } from "@/lib/auth/dal";
import prisma from "@/lib/prisma/client";

import CourseHero from "@/features/courses/course-details/CourseHero";
import CourseStats from "@/features/courses/course-details/CoursesStats";
import CourseDescription from "@/features/courses/course-details/CourseDescription";
import CourseHighlights from "@/features/courses/course-details/CourseHighlights";
import CourseTestimonials from "@/features/courses/course-details/CourseTestimonials";
import CourseCTA from "@/features/courses/course-details/CourseCTA";

type CoursePageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

// 2. Función asíncrona para buscar el curso específico
async function fetchCourseData(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/courses`, {
      cache: 'no-store'
    });

    if (!res.ok) throw new Error("Error de conexión con la API");

    const allCourses: Course[] = await res.json();

    // Buscamos el slug dentro de la respuesta de Supabase
    const apiCourse = allCourses.find((c) => c.slug === slug);

    // 3. LA RED DE SEGURIDAD: Si no existe en la BD, buscamos en el mock
    return apiCourse || mockCourses.find((c) => c.slug === slug);
  } catch {
    // Si la API crashea, caemos en el Plan B en silencio
    return mockCourses.find((c) => c.slug === slug);
  }
}

export default async function CoursePage({
  params,
}: CoursePageProps) {
  const { locale, slug } = await params;

  // 4. Invocamos la función para obtener la data real o el fallback y la sesión actual
  const [course, user] = await Promise.all([
    fetchCourseData(slug),
    getCurrentUser(),
  ]);

  if (!course) {
    notFound();
  }

  let isEnrolled = false;
  if (user) {
    try {
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: course.id,
          status: { not: "CANCELLED" },
        },
        select: { id: true },
      });
      isEnrolled = Boolean(existingEnrollment);
    } catch {
      isEnrolled = false;
    }
  }

  const isLoggedIn = Boolean(user);
  const currentPath = `/${locale}/courses/${slug}`;

  return (
    <main className="min-h-screen bg-background">
      <CourseHero
        course={course}
        isEnrolled={isEnrolled}
        isLoggedIn={isLoggedIn}
        currentPath={currentPath}
      />
      <CourseStats course={course} />
      <CourseDescription course={course} />
      <CourseHighlights course={course} />
      <CourseTestimonials course={course} />
      <CourseCTA
        course={course}
        isEnrolled={isEnrolled}
        isLoggedIn={isLoggedIn}
        currentPath={currentPath}
      />
    </main>
  );
}
