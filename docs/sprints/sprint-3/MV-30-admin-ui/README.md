# MV-31: Diseño UI del panel admin

**Responsable:** Juan Pablo Arce Jauregui (Equipo de TI - Maestro Virtual A.C.)
**Fecha de implementación:** Octubre 2026
**Sprint:** Sprint 3
**Épica:** Panel de administración
**Story Points:** 5

---

## 1. Objetivo

Diseñar y construir los componentes base y las pantallas del panel de administración (lista de cursos, formularios de creación/edición, vista de eventos y bandeja de mensajes), reutilizando el sistema de diseño (colores, tipografía y componentes) del sitio público.

**Criterio de aceptación:** contar con los componentes base e interfaces del panel aprobados y estructurados antes de completar su integración con el backend.

---

## 2. Alcance

Incluye:

- Estructura general (Layout) del panel de administración en `/[locale]/admin/**` con barra de navegación lateral (*Sidebar*) y área de trabajo principal.
- Navegación lateral con acceso a `Dashboard`, `Cursos`, `Eventos`, `Mensajes` e indicador de rol `ADMIN` junto al logo institucional.
- Sección inferior de sesión de usuario con avatar y botón `Cerrar Sesión`.
- Diseño de las vistas y tarjetas base para la gestión de cursos y eventos (etiquetas de estado `PUBLICADO` / `BORRADOR`, indicadores de duración, modalidad y botones de acción `Editar` / `Eliminar`).
- Componentes base de formularios modales (creación/edición), diálogos de confirmación y estructura visual para la bandeja de mensajes.

No incluye (otras tareas):

- Conexión funcional completa del CRUD de cursos con Prisma y Server Actions (MV-31-admin-courses).
- Conexión funcional completa del CRUD de eventos con Prisma (MV-32).
- Autenticación de staff, firma de cookies y protección de rutas mediante proxy (MV-33).
- Integración de datos reales en la bandeja de mensajes de contacto (MV-34).

---

## 3. Decisión: separación de Layout administrativo y reutilización del sistema de diseño

Para construir el panel de administración manteniendo consistencia visual con el portal público pero evitando colisiones con la navegación de usuarios finales, se tomaron las siguientes decisiones de interfaz:

| Decisión de UI | Justificación técnica y de UX |
|----------------|-------------------------------|
| **Layout exclusivo en `/[locale]/admin/layout.tsx`** | Separa el *Sidebar* fijo oscuro del *Navbar* y *Footer* públicos, ofreciendo un entorno de trabajo enfocado para el staff. |
| **Sistema de diseño unificado en Tailwind CSS** | Reutiliza la paleta institucional (azul primario `bg-blue-600`, fondos claros, tarjetas blancas con bordes redondeados) y la tipografía serif/sans del sitio público. |
| **Etiquetas semánticas de estado (`Badges`)** | Diferencia visualmente al instante los registros en estado `PUBLICADO` (verde) frente a `BORRADOR` (amarillo) sobre la miniatura de cada tarjeta. |
| **Formularios en Modales superpuestos** | Permite al staff crear o editar registros sin perder el contexto visual del listado principal ni recargar páginas completas. |

---

## 4. Arquitectura de componentes visuales

src/app/[locale]/admin/layout.tsx (Estructura base: Sidebar + contenedor principal)
│
├──► /[locale]/admin/page.tsx (Vista resumen / Dashboard)
├──► /[locale]/admin/cursos/page.tsx
│      └──► AdminCoursesView.tsx
│             ├──► AdminCourseCard.tsx (Tarjeta con estado, metadatos y acciones)
│             ├──► CourseModal.tsx (Formulario UI de creación/edición)
│             └──► DeleteConfirmModal.tsx (Diálogo visual de confirmación)
├──► /[locale]/admin/eventos/page.tsx (Vista y tarjetas de eventos)
└──► /[locale]/admin/mensajes/page.tsx (Interfaz de bandeja de entrada)

| Componente / Ruta | Responsabilidad visual |
|-------------------|------------------------|
| `src/app/[locale]/admin/layout.tsx` | Contenedor flex con barra lateral izquierda fija (`slate-900`), logo con insignia `ADMIN`, enlaces activos de navegación y botón `Cerrar Sesión`. |
| `src/features/admin/components/AdminCoursesView.tsx` | Encabezado de sección («Administrar Cursos»), botón de acción primaria (`+ Crear Nuevo Curso`), cuadrícula responsiva (*grid*) y estado vacío (*Empty State*). |
| `src/features/admin/components/AdminCourseCard.tsx` | Tarjeta con contenedor de imagen (o placeholder «Sin Imagen»), insignia de estado, título, descripción truncada, píldoras de duración/modalidad y botones `Editar` y `Eliminar`. |
| `src/features/admin/components/CourseModal.tsx` | Interfaz de formulario organizada por secciones con campos validados, selectores y estados de carga (*spinner*). |
| `src/features/admin/components/DeleteConfirmModal.tsx` | Modal de alerta en tonos rojos para prevenir borrados accidentales por parte del staff. |

---

## 5. Convenciones visuales del panel

| Elemento | Estilo aplicado | Uso en el panel |
|----------|-----------------|-----------------|
| **Acción principal** | Botón azul sólido (`bg-blue-600`) con ícono `+` | Crear nuevo curso o evento en la esquina superior derecha. |
| **Acción secundaria** | Botón con borde azul y fondo blanco | Acción «Editar» dentro de cada tarjeta. |
| **Acción destructiva** | Botón rojo sólido (`bg-red-600`) con ícono de papelera | Acción «Eliminar» en tarjetas y confirmación de borrado. |
| **Estado Publicado** | Píldora verde claro con texto verde oscuro (`PUBLICADO`) | Indica que el curso o evento es visible en el sitio público. |
| **Estado Borrador** | Píldora amarilla clara con texto ámbar (`BORRADOR`) | Indica que el registro solo es visible dentro del panel admin. |

---

## 6. Visualización en entorno local

1. Configurar `DATABASE_URL` y `AUTH_SECRET` (mínimo 32 caracteres) en el archivo `.env` local.
2. Iniciar el servidor de desarrollo con `npm run dev`.
3. Autenticarse con una cuenta de rol `STAFF` en `/es/staff/login`.
4. Recorrer las vistas del menú lateral (`/es/admin`, `/es/admin/cursos`, `/es/admin/eventos`, `/es/admin/mensajes`) para verificar la responsividad, estados activos del *Sidebar* y apertura de modales.

---

## 7. Para tareas posteriores del Sprint 3

- **CRUD de cursos y eventos (MV-31 / MV-32):** los componentes visuales y modales construidos en esta tarea sirven como base directa para conectar las Server Actions y endpoints de Prisma.
- **Bandeja de mensajes (MV-34):** la ruta y el contenedor del panel quedan listos para listar los registros de la tabla `mensajes_contacto` ordenados por fecha y estado de lectura.
- **Pruebas E2E (MV-35):** la consistencia en textos de botones (`+ Crear Nuevo Curso`, `Editar`, `Eliminar`, `Cerrar Sesión`) facilita la selección de elementos en Playwright.