import CoursesHero from './components/CoursesHero';
import LearningPath from './components/LearningPath';
import CoursesClient from './components/CoursesClient';
import { courses as mockCourses, Course } from './data/courses';
import prisma from "@/lib/prisma/client";

async function fetchCursosReales(): Promise<Course[]> {
  try {
    console.log("🕵️ Consultando BD con límite de tiempo (4s)...");

    // 1. Creamos un cronómetro de 4 segundos (alineado con el timeout del pool)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Supabase tardó demasiado en responder")), 4000)
    );

    // 2. La consulta real a Prisma
    const dbQuery = prisma.course.findMany();

    // 3. Competencia: Si la BD tarda más de 4 segundos, gana el timeout y cancela la espera
    const data = await Promise.race([dbQuery, timeoutPromise]);

    console.log("✅ Cursos recibidos directo de la BD:", (data as any).length);
    return data as unknown as Course[];
  } catch (error) {
    console.error("⚠️ Fallo en la conexión a la BD:", error instanceof Error ? error.message : error);
    console.log("Activando Red de Seguridad (Mock de cursos) de inmediato.");
    return []; // Devuelve vacío para que instantáneamente cargue el Mock
  }
}

export default async function CoursesSection() {
  const cursosAPI = await fetchCursosReales();

  const safeCourses = (cursosAPI && cursosAPI.length > 0)
    ? cursosAPI
    : mockCourses;

  return (
    <section aria-labelledby="courses-section-title">
      <CoursesHero />
      <div className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">
          <section aria-labelledby="courses-categories-title" className="space-y-4">
            <h3 id="courses-categories-title" className="text-lg font-semibold text-text-primary">
              Categorías
            </h3>
            <CoursesClient courses={safeCourses} />
          </section>
          <LearningPath />
        </div>
      </div>
    </section>
  );
}