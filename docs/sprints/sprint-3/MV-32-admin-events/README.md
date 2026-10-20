# MV-32: CRUD visual de eventos

**Responsable:** Juan Pablo Arce Jauregui (Equipo de TI - Maestro Virtual A.C.)
**Fecha de implementación:** Octubre 2026
**Sprint:** Sprint 3
**Épica:** Panel de administración
**Story Points:** 8

---

## 1. Objetivo

Construir la interfaz administrativa donde el staff de Maestro Virtual A.C. pueda consultar, crear, editar y eliminar eventos y talleres de manera visual, gestionando todos los metadatos del modelo `Event` (incluyendo imagen, fecha, horario, modalidad, plataforma/sede, categoría y estado de publicación) y reflejando los cambios de inmediato en la plataforma.

**Criterios de aceptación:**
- Una persona sin conocimientos técnicos puede agregar, editar o eliminar un evento completo (con imagen y ubicación/plataforma) desde el panel sin ayuda técnica.
- Los cambios realizados se reflejan de inmediato tanto en el panel administrativo como en la agenda pública de eventos.

---

## 2. Alcance

Incluye:

- Vista administrativa de eventos en `/[locale]/admin/eventos` (y su alias `/[locale]/admin/events`) con precarga SSR.
- Modal dual (`EventModal`) para **Crear** y **Editar** eventos con selector de fecha, horario, modalidad dinámica (en línea vs presencial) y validación de campos obligatorios.
- Modal de confirmación adaptado (`DeleteConfirmModal`) para **Eliminar** eventos de forma segura mostrando el título del evento y aplicando eliminación física.
- Server Actions (`event.actions.ts`) y ajuste en los Route Handlers (`/api/events` y `/api/events/[id]`) para soportar el listado completo (`?all=true`), creación, edición y eliminación física.
- Tipado estricto en TypeScript (`AdminEvent`, `EventFormData`) con 0 uso de `any`.
- Pruebas unitarias completas del flujo visual y de modales en Jest (`__tests__/admin-events.test.tsx`).

No incluye (otras tareas):

- CRUD visual de cursos (MV-31).
- Autenticación y protección de rutas de staff (implementado en MV-33).
- Bandeja de mensajes de contacto (MV-34).
- Pruebas E2E automatizadas del flujo completo en navegador (MV-35).

---

## 3. Decisión: eliminación física (`delete`) en lugar de baja lógica (`isActive: false`)

Al igual que en el módulo de cursos (MV-31), el endpoint `DELETE /api/events/[id]` y la Server Action `deleteEventAction` ejecutan **eliminación física (`prisma.event.delete`)**:

| Evidencia | Qué indica |
|-----------|------------|
| En el dominio del panel, `isActive: true` representa **PUBLICADO** y `isActive: false` representa **BORRADOR** | El campo booleano controla la visibilidad en la agenda pública, no su existencia en el sistema |
| `getAdminEvents()` consulta todos los registros (publicados y borradores) para que el staff pueda editarlos | Si el borrado solo cambiara `isActive: false`, al ejecutar `router.refresh()` el evento volvería a aparecer en la cuadrícula como «Borrador» |
| Si un evento ya estaba en estado «Borrador» (`isActive: false`), el botón «Eliminar» no producía ningún cambio en la base de datos | Imposibilidad de purgar eventos de prueba o descartados desde la UI |
| `prisma/schema.prisma` define `onDelete: SetNull` en `Enrollment` | El esquema ya está preparado para eliminar eventos físicamente sin romper la integridad referencial |

Con esta decisión, el staff puede alternar libremente un evento entre **Publicado** y **Borrador** desde el modal de edición, mientras que el botón **Eliminar** purga definitivamente el registro tras confirmar en el diálogo de seguridad.

---

## 4. Arquitectura

```text
/[locale]/admin/eventos/page.tsx y /events/page.tsx (Server Components, force-dynamic)
│
├──► getAdminEvents() (Prisma: ordenados por fecha DESC)
▼
AdminEventsView.tsx (Client Component)
│
├──► "+ Crear Nuevo Evento" / "Editar" ──► EventModal.tsx
│                                              │
│                                              ├──► createEventAction() / POST /api/events
│                                              └──► updateEventAction() / PUT /api/events/[id]
│
└──► "Eliminar" ──► DeleteConfirmModal.tsx
│
└──► deleteEventAction() / DELETE /api/events/[id]
│
▼
Actualización de estado local + revalidatePath + router.refresh()
```

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/app/[locale]/admin/eventos/page.tsx` y `events/page.tsx` | Server Components con `dynamic = "force-dynamic"` que obtienen los eventos vía `getAdminEvents()` y renderizan la vista. |
| `src/features/admin/components/AdminEventsView.tsx` | Cuadrícula principal, control de modales, sincronización de estado local e invocación de `router.refresh()`. Incluye estado vacío (*Empty State*). |
| `src/features/admin/components/AdminEventCard.tsx` | Tarjeta visual de cada evento con etiqueta de estado (`PUBLICADO` / `BORRADOR`), fecha, horario, modalidad dinámica y botones de acción. |
| `src/features/admin/components/EventModal.tsx` | Formulario modal reutilizable (Crear/Editar) con selectores de fecha/hora, modalidad dinámica (plataforma virtual vs sede física), validaciones y estado `isSubmitting`. |
| `src/features/admin/components/DeleteConfirmModal.tsx` | Diálogo de confirmación de borrado con alerta visual, nombre del evento e indicador `isDeleting`. |
| `src/features/admin/actions/event.actions.ts` | Server Actions (`getAdminEvents`, `createEventAction`, `updateEventAction`, `deleteEventAction`) con normalización de datos y `revalidatePath`. |
| `src/features/admin/types/event.types.ts` | Definición de interfaces estrictas `AdminEvent` y `EventFormData`. |
| `src/app/api/events/route.ts` y `[id]/route.ts` | Endpoints REST protegidos con `requireStaffApi()` que respaldan las operaciones de lectura (`?all=true`), creación, edición y eliminación física. |

### Sincronización inmediata y manejo de caché

1. **En el servidor:** Las Server Actions ejecutan `revalidatePath` sobre las rutas del panel (`/admin/eventos`, `/admin/events`) y de la agenda pública (`/eventos`, `/events`).
2. **En el cliente:** `AdminEventsView` actualiza su arreglo local de inmediato para evitar parpadeos en la interfaz e invoca `router.refresh()` para rehidratar los Server Components con el estado real de la base de datos.

---

## 5. Campos del formulario y mapeo con Prisma

El formulario dentro de `EventModal.tsx` agrupa todos los campos requeridos por el modelo `Event` en cuatro bloques:

| Sección | Campos gestionados | Notas técnicas |
|---------|--------------------|----------------|
| **Información básica** | `title`, `description`, `category`, `image` | Título y descripción obligatorios. Selector de categorías estándar de Maestro Virtual y soporte para banner personalizado. |
| **Fecha, Horario y Modalidad** | `date`, `time`, `modality`, `platform`, `location`, `address` | Selector HTML `<input type="date">` formateado en `YYYY-MM-DD`. Conmuta dinámicamente entre plataforma virtual (`ONLINE`) y sede/dirección (`IN_PERSON`). |
| **Audiencia y requisitos** | `profile`, `participants`, `duration`, `objective`, `requirements` | Campos descriptivos opcionales para orientar a los asistentes. |
| **Estado de publicación** | `isActive` | `isActive: true` (Publicado) vs `isActive: false` (Borrador). |

---

## 6. Probar el CRUD de eventos en local

1. Asegurarse de tener `DATABASE_URL` y `AUTH_SECRET` configurados en `.env`.
2. Iniciar sesión con una cuenta de rol `STAFF` en `/es/staff/login`.
3. Navegar a `/es/admin/eventos`.
4. Probar el ciclo completo:
   - Hacer clic en **«+ Crear Nuevo Evento»**, llenar los campos y guardar.
   - Hacer clic en **«Editar»** sobre la tarjeta creada, alternar entre *Publicado* y *Borrador* y verificar el cambio visual en la etiqueta.
   - Hacer clic en **«Eliminar»**, confirmar en el modal y verificar que desaparezca de la cuadrícula y no reaparezca al recargar la página.

---

## 7. Pruebas

| Tipo | Archivo / Comando | Qué cubre |
|------|-------------------|-----------|
| Tipado estático | `npx tsc --noEmit` | Verificación de `0` errores de TypeScript e interfaces estrictas (`AdminEvent`, `EventFormData`). |
| Unitarias / Integración UI | `__tests__/admin-events.test.tsx` | 9 pruebas unitarias: renderizado de tarjetas, conmutación de modalidades, apertura de modales, creación, edición y confirmación de eliminación física. |
| Suite general | `npm test` | 25 suites de prueba (254 pruebas en total) pasando al 100% sin regresiones. |
