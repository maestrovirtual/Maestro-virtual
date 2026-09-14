import { notFound } from "next/navigation";

// 1. Importamos los datos locales únicamente como Plan B (Red de Seguridad)
import { courses as mockCourses, type Course } from "@/features/courses/data/courses";

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
  } catch (error) {
    // Si la API crashea, caemos en el Plan B en silencio
    return mockCourses.find((c) => c.slug === slug);
  }
}

export default async function CoursePage({
  params,
}: CoursePageProps) {
  const { slug } = await params;

  // 4. Invocamos la función para obtener la data real o el fallback
  const course = await fetchCourseData(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <CourseHero course={course} />
      <CourseStats course={course} />
      <CourseDescription course={course} />
      <CourseHighlights course={course} />
      <CourseTestimonials course={course} />
      <CourseCTA course={course} />
    </main>
  );
}