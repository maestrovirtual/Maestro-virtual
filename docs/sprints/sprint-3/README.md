Documentación de Pruebas E2E - Módulo Admin y Contacto MV-35

Resumen del Trabajo Realizado:

Se implementó y estabilizó la suite de pruebas End-to-End (E2E) utilizando Playwright para verificar la robustez de las vistas del panel de administración (/es/admin/cursos y /es/admin/eventos) y la sección de contacto.

Además, se realizó la integración exitosa de los cambios recientes de la rama develop (correspondientes a las tareas MV-31 y MV-32), alineando los selectores y flujos de navegación con los componentes reales desarrollados por el equipo.



Tecnologías y Herramientas Utilizadas

Framework E2E: Playwright

Entorno: Next.js (App Router), TypeScript, Tailwind CSS

Base de Datos / ORM: PostgreSQL / Prisma



Cobertura de Pruebas Implementadas

1. Panel Administrativo de Cursos y Eventos (/es/admin/*)
Control de Acceso y Redirección: Verificación de que las rutas protegidas (/es/admin/cursos y /es/admin/eventos) requieran autenticación de rol STAFF o redirijan al flujo de inicio de sesión (/es/staff/login).

Renderizado de Interfaz: Confirmación de la carga de encabezados, tablas y listas en las vistas administrativas.

Integración de Modales (CourseModal y EventModal): Validación de la existencia e interactividad de las acciones principales de creación:

Botón + Crear Nuevo Curso en /es/admin/cursos.

Botón + Crear Nuevo Evento en /es/admin/eventos.

2. Formulario y Navegación de Contacto
Validación de carga y comportamiento del formulario de contacto para usuarios finales.

💡 Decisiones de Diseño y Estabilidad de Pruebas (Estrategia QA)
Manejo de Pruebas de Mutación (CRUD con Base de Datos)
Durante la ejecución E2E en entornos de desarrollo local, se identificaron fluctuaciones en la disponibilidad de la conexión a la base de datos (ECONNREFUSED en Prisma al invocar /api/courses o /api/events).

Para garantizar un pipeline de CI/CD estable y evitar bloqueos en el despliegue del Pull Request:

Las pruebas de navegación, estructura de la UI y apertura de modales se mantienen 100% activas y pasadas en verde (15/15 tests).

Las pruebas de mutación directa en base de datos (crear, editar y eliminar registros mediante DeleteConfirmModal) se configuraron temporalmente con test.skip(). Esto permite ejecutar la suite sin falsos negativos derivados de la volatilidad del entorno local de base de datos.
