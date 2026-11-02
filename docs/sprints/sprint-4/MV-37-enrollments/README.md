# MV-37: Flujo de inscripción a cursos y eventos

**Responsable:** Juan Pablo Arce Jáuregui (Frontend)
**Sprint:** 4
**Épica:** Inscripción a cursos y eventos
**Story Points:** 8

---

## 1. Resumen Ejecutivo
Implementación del flujo de inscripción para usuarios finales desde el catálogo público de cursos y eventos, junto con la vista de seguimiento de inscritos en el Panel Administrativo. La funcionalidad garantiza que un usuario autenticado pueda registrarse con un solo clic, delegando la validación de la sesión y el bloqueo de inscripciones duplicadas directamente en la capa de base de datos mediante Server Actions, mientras el staff consulta las inscripciones registradas por cada curso o evento.

**Criterios de aceptación cumplidos:**
- [x] El usuario logueado puede inscribirse a un curso o evento.
- [x] El sistema valida duplicados a nivel de base de datos (se omite el estado `CANCELLED`).
- [x] La interfaz refleja inmediatamente el estado de inscripción (botón bloqueado).
- [x] Los visitantes sin sesión son redirigidos al login conservando la ruta de origen.
- [x] La inscripción queda visible tanto para el usuario como en el panel admin.

---

## 2. Arquitectura y Cambios Técnicos

### 2.1. Server Action (`src/features/enrollments/actions/enrollment.actions.ts`)
- **`enrollUserAction(itemId, type)`:** 
  - Obtiene la sesión segura mediante `getCurrentUser()` (integración con MV-36).
  - Lanza error `401 Unauthorized` si no hay sesión activa.
  - Ejecuta `prisma.enrollment.findFirst` para verificar la existencia previa de una inscripción del `userId` hacia el `courseId` o `eventId`, filtrando explícitamente aquellos con `status: "CANCELLED"`.
  - Crea el registro en Prisma con estado `REGISTERED` y ejecuta `revalidatePath` para invalidar la caché de la vista actual.

### 2.2. Componente Cliente (`src/features/enrollments/components/EnrollButton.tsx`)
Diseñado para reaccionar a tres estados de sesión inyectados desde el servidor:
1. **Visitante (`isLoggedIn: false`):** Redirige a `/${locale}/login?next=${currentPath}` (resolviendo el idioma activo con `useParams`) para evitar errores 404 y conservar la ruta de retorno.
2. **Usuario Autenticado (`isLoggedIn: true, isEnrolled: false`):** Al hacer clic despliega un Modal centrado con un `<form action={...}>` de confirmación (`"Cancelar"` y `"Confirmar Inscripción"`), manejando `isPending` mediante `useActionState`, cerrando el modal tras el éxito y mostrando retroalimentación accesible.
3. **Usuario Inscrito (`isEnrolled: true`):** Bloquea el componente visualmente (estado neutro/gris) con la leyenda "Ya estás inscrito".

### 2.3. Integración SSR en Vistas Públicas
Para evitar parpadeos de hidratación, el estado de la inscripción se resuelve en el servidor antes de renderizar la página.
- **Archivos modificados:**
  - `src/app/[locale]/(public)/courses/[slug]/page.tsx`
  - `src/features/courses/course-details/CourseHero.tsx`
  - `src/features/courses/course-details/CourseCTA.tsx`
  - `src/features/events/EventsSection.tsx`
  - `src/features/events/EventCard.tsx`
- **Cambios en Interfaces:** Se extendieron `CourseCTAProps`, `CourseHeroProps`, `EventCardProps` y `EventsSectionProps` para aceptar de forma tipada `isEnrolled: boolean`, `isLoggedIn: boolean` y `currentPath: string`.

### 2.4. Visibilidad en Panel Administrativo
- **`AdminEnrollmentsTable.tsx` (`src/features/admin/components/AdminEnrollmentsTable.tsx`):** Server Component que recibe `courseId` o `eventId`, consulta `prisma.enrollment.findMany` incluyendo `{ user: { select: { name: true, email: true } } }` y despliega una tabla con Nombre, Correo, Fecha de inscripción y Estado (o el estado vacío `"No hay inscripciones aún"`).
- **Vistas de Detalle/Edición de Staff:**
  - `src/app/[locale]/admin/cursos/[id]/page.tsx` (y alias `courses/[id]/page.tsx`)
  - `src/app/[locale]/admin/eventos/[id]/page.tsx` (y alias `events/[id]/page.tsx`)
  - `src/features/admin/components/EventForm.tsx`
  - Enlaces directos `"Detalle e inscritos"` integrados en `AdminCourseCard.tsx` y `AdminEventCard.tsx`.

---

## 3. Decisiones de Diseño

1. **Retención de Contexto (`?next=`):** Al integrar la validación en el componente, evitamos que un usuario interesado en un curso pierda la navegación si necesita crear una cuenta primero.
2. **Filtro de Estado `CANCELLED`:** A nivel de validación de Prisma, omitir los registros cancelados previene colisiones si en el futuro un alumno decide retomar un curso del que previamente se había dado de baja.
3. **Optimización de Server Components:** Extraer la validación de `prisma.enrollment.findFirst` hacia el layout superior de la página y pasar el resultado como Prop reduce drásticamente las consultas en cascada al renderizar listas de eventos.

---

## 4. Métricas de Calidad
- **Tipado Estricto:** Ejecución de `npx tsc --noEmit` completada sin errores (0 `any` detectados).
- **Cobertura de Pruebas:** Implementación de `__tests__/enrollment-button.test.tsx` y `__tests__/admin-enrollments-table.test.tsx` en Jest, validando exitosamente el comportamiento del botón y la tabla administrativa de inscritos.
- **QA Manual:** Verificación en base de datos local usando Prisma Studio garantizando la correcta creación de registros en la tabla `Enrollment` y la imposibilidad de inyectar duplicados.
