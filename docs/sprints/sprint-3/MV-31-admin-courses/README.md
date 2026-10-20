# MV-31: CRUD visual de cursos

**Responsable:** Juan Pablo Arce Jauregui (Equipo de TI - Maestro Virtual A.C.)
**Fecha de implementación:** Octubre 2026
**Sprint:** Sprint 3
**Épica:** Panel de administración
**Story Points:** 8

---

## 1. Objetivo

Construir la interfaz administrativa donde el staff de Maestro Virtual A.C. pueda consultar, crear, editar y eliminar cursos de manera visual, gestionando todos los metadatos del modelo `Course` (incluyendo imagen, modalidad, categoría, etapa y estado de publicación) y reflejando los cambios de inmediato en la plataforma.

**Criterios de aceptación:**
- Una persona sin conocimientos técnicos puede agregar, editar o eliminar un curso completo (con imagen) desde el panel sin ayuda técnica.
- Los cambios realizados se reflejan de inmediato tanto en el panel administrativo como en el sitio público.

---

## 2. Alcance

Incluye:

- Vista administrativa de cursos en `/[locale]/admin/cursos` (y su alias `/[locale]/admin/courses`) con precarga SSR.
- Modal dual (`CourseModal`) para **Crear** y **Editar** cursos con autogeneración de `slug` y validación de campos obligatorios.
- Modal de confirmación (`DeleteConfirmModal`) para **Eliminar** cursos de forma segura mostrando el título del curso.
- Server Actions (`course.actions.ts`) y ajuste en los Route Handlers (`/api/courses` y `/api/courses/[id]`) para soportar el listado completo (`?all=true`), creación, edición y eliminación física.
- Tipado estricto en TypeScript (`AdminCourse`, `CourseFormData`) sin uso de `any`.
- Pruebas unitarias del flujo visual y de modales en Jest.

No incluye (otras tareas):

- Diseño base de la estructura general del panel (MV-30).
- CRUD visual de eventos (MV-32).
- Autenticación y protección de rutas de staff (implementado en MV-33).
- Bandeja de mensajes de contacto (MV-34).
- Pruebas E2E automatizadas del flujo completo en navegador (MV-35).

---

## 3. Decisión: eliminación física (`delete`) en lugar de baja lógica (`isActive: false`)

Originalmente, el endpoint `DELETE /api/courses/[id]` y la acción de borrado aplicaban una baja lógica actualizando `isActive: false`. Sin embargo, durante la implementación se decidió cambiar a **eliminación física (`prisma.course.delete`)** por las siguientes razones:

| Evidencia | Qué indica |
|-----------|------------|
| En el dominio del panel, `isActive: true` representa **PUBLICADO** y `isActive: false` representa **BORRADOR** | El campo booleano controla la visibilidad pública del curso, no su existencia en el sistema |
| `getAdminCourses()` consulta todos los registros (publicados y borradores) para que el staff pueda editarlos | Si el borrado solo cambia `isActive: false`, al ejecutar `router.refresh()` el curso vuelve a aparecer en la cuadrícula como «Borrador» |
| Si un curso ya estaba en estado «Borrador» (`isActive: false`), el botón «Eliminar» no producía ningún cambio en la base de datos | Imposibilidad de purgar cursos de prueba o descartados desde la UI |
| `prisma/schema.prisma` define `onDelete: Cascade` en `CourseTestimonial` y `onDelete: SetNull` en `Enrollment` | El esquema ya está preparado para eliminar cursos físicamente sin romper la integridad referencial |

Con esta decisión, el staff puede alternar libremente un curso entre **Publicado** y **Borrador** desde el modal de edición, mientras que el botón **Eliminar** purga definitivamente el registro tras confirmar en el diálogo de seguridad.

---

## 4. Arquitectura

/[locale]/admin/cursos/page.tsx (Server Component, force-dynamic)
│
├──► getAdminCourses() (Prisma: ordenados por createdAt DESC)
▼
AdminCoursesView.tsx (Client Component)
│
├──► "+ Crear Nuevo Curso" / "Editar" ──► CourseModal.tsx
│                                              │
│                                              ├──► createCourseAction() / POST /api/courses
│                                              └──► updateCourseAction() / PUT /api/courses/[id]
│
└──► "Eliminar" ──► DeleteConfirmModal.tsx
│
└──► deleteCourseAction() / DELETE /api/courses/[id]
│
▼
Actualización de estado local + revalidatePath + router.refresh()

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/app/[locale]/admin/cursos/page.tsx` y `courses/page.tsx` | Server Components con `dynamic = "force-dynamic"` que obtienen los cursos vía `getAdminCourses()` y renderizan la vista. |
| `src/features/admin/components/AdminCoursesView.tsx` | Cuadrícula principal, control de apertura/cierre de modales, sincronización de estado local e invocación de `router.refresh()`. Incluye estado vacío (*Empty State*). |
| `src/features/admin/components/AdminCourseCard.tsx` | Tarjeta visual de cada curso con etiqueta de estado (`PUBLICADO` / `BORRADOR`), duración, modalidad y botones de acción. |
| `src/features/admin/components/CourseModal.tsx` | Formulario modal reutilizable (Crear/Editar) con autogeneración de `slug` en *kebab-case*, validaciones de cliente y estado `isSubmitting`. |
| `src/features/admin/components/DeleteConfirmModal.tsx` | Diálogo de confirmación de borrado con alerta visual, nombre del curso e indicador `isDeleting`. |
| `src/features/admin/actions/course.actions.ts` | Server Actions (`getAdminCourses`, `createCourseAction`, `updateCourseAction`, `deleteCourseAction`) con mapeo de enums y `revalidatePath`. |
| `src/features/admin/types/course.types.ts` | Definición de interfaces estrictas `AdminCourse` y `CourseFormData`. |
| `src/app/api/courses/route.ts` y `[id]/route.ts` | Endpoints REST protegidos con `requireStaffApi()` que respaldan las operaciones de lectura (`?all=true`) y escritura. |

### Sincronización inmediata y manejo de caché

En Next.js App Router, modificar datos mediante una acción requiere actualizar tanto la vista del cliente como la caché de rutas del servidor:

1. **En el servidor:** Las Server Actions ejecutan `revalidatePath` sobre las rutas del panel y del catálogo público tras cada `create`, `update` o `delete`.
2. **En el cliente:** `AdminCoursesView` actualiza su arreglo local de inmediato para evitar parpadeos en la interfaz e invoca `router.refresh()` para rehidratar los Server Components con el estado real de PostgreSQL.

---

## 5. Campos del formulario y mapeo con Prisma

El formulario dentro de `CourseModal.tsx` agrupa todos los campos requeridos por el modelo `Course` en cuatro bloques:

| Sección | Campos gestionados | Notas técnicas |
|---------|--------------------|----------------|
| **Información básica** | `title`, `slug`, `shortDescription`, `description` | El `slug` se autogenera a partir de `title` (sin acentos ni caracteres especiales), pero permite edición manual. |
| **Formación y modalidad** | `type`, `stage`, `modality`, `duration`, `sessions`, `hoursPerSession`, `categories`, `skills` | Los enums `CourseType` (`CURSO`, `TALLER`, `CONFERENCIA`) y `Stage` (`UNO`, `DOS`, `TRES`) se normalizan con `src/lib/prisma/course-enums.ts`. |
| **Audiencia y requisitos** | `objective`, `targetAudience`, `requirements`, `participants` | Campos de texto validados antes del envío. |
| **Apariencia y publicación** | `image`, `color`, `backgroundPattern`, `isActive`, `featured` | `isActive` define si el curso se guarda como **Publicado** (`true`) o **Borrador** (`false`). |

---

## 6. Probar el CRUD de cursos en local

1. Asegurarse de tener `DATABASE_URL` y `AUTH_SECRET` (mínimo 32 caracteres) configurados en `.env`.
2. Iniciar sesión con una cuenta de rol `STAFF` en `/es/staff/login` (ver documentación de MV-33).
3. Navegar a `/es/admin/cursos`.
4. Probar el ciclo completo:
   - Hacer clic en **«+ Crear Nuevo Curso»**, llenar los campos obligatorios y guardar.
   - Hacer clic en **«Editar»** sobre la tarjeta creada, cambiar el estado entre *Publicado* y *Borrador* y verificar el cambio de etiqueta.
   - Hacer clic en **«Eliminar»**, confirmar en el modal y verificar que desaparezca de la cuadrícula y no reaparezca al recargar la página.

---

## 7. Para tareas futuras

- **MV-32 (CRUD visual de eventos):** puede reutilizar el patrón arquitectónico de `AdminCoursesView` y el diálogo `DeleteConfirmModal`, asegurándose de implementar también eliminación física (`prisma.event.delete`) para evitar colisiones con el estado de borrador.
- **MV-35 (Pruebas E2E del panel admin):** los selectores de botones (`+ Crear Nuevo Curso`, `Editar`, `Eliminar`) y los estados de carga (`isSubmitting`, `isDeleting`) están listos para ser consumidos por Playwright.

---

## 8. Pruebas

| Tipo | Archivo / Comando | Qué cubre |
|------|-------------------|-----------|
| Tipado estático | `npx tsc --noEmit` | Verificación de `0` errores de TypeScript e interfaces estrictas (`AdminCourse`, `CourseFormData`). |
| Unitarias / Integración UI | `__tests__/admin-courses.test.tsx` | 7 pruebas nuevas: renderizado de tarjetas, apertura de modales, autogeneración de `slug`, flujo de edición y confirmación de eliminación. |
| Suite general | `npm test` | 24 suites de prueba (243 pruebas en total) pasando al 100% sin regresiones. |