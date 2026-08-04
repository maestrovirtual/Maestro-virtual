import CoursesHero from './components/CoursesHero';
import LearningPath from './components/LearningPath';
import CoursesClient from './components/CoursesClient';

// 1. Renombramos los datos estáticos para identificarlos como el Plan B
// Y traemos la interfaz 'Course' para tipar correctamente los datos
import { courses as mockCourses, Course } from './data/courses';

// 2. Abrimos la "puerta" para recibir los datos del backend
// (¡Adiós any! Ahora TypeScript sabe exactamente qué forma tiene un curso)
interface CoursesSectionProps {
  cursosDelBackend?: Course[];
}

export default function CoursesSection({ cursosDelBackend }: CoursesSectionProps) {

  // 3. LA RED DE SEGURIDAD (Ticket 11)
  // Revisa si el backend manda cursos. Si falla o manda 0, usa tus mockCourses.
  const safeCourses = (cursosDelBackend && cursosDelBackend.length > 0)
    ? cursosDelBackend
    : mockCourses;

  return (
    <section aria-labelledby="courses-section-title">

      <CoursesHero />

      <div className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl space-y-10">

          <section
            aria-labelledby="courses-categories-title"
            className="space-y-4"
          >
            <h3
              id="courses-categories-title"
              className="text-lg font-semibold text-text-primary"
            >
              Categorías
            </h3>

            {/* 4. Le inyectamos los safeCourses al componente hijo para que nunca se rompa */}
            <CoursesClient
              courses={safeCourses}
            />

          </section>

          <LearningPath />

        </div>
      </div>

    </section>
  );
}