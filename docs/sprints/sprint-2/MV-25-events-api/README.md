# MV-25: Events API Integration & Smart Filtering

**Responsable:** Juan Pablo Arce Jauregui "Tonpro" (Equipo de TI - Maestro Virtual A.C.)  
**Fecha de decisión:** Septiembre 2026  
**Épica:** Cursos y eventos dinámicos

## Descripción
Este documento detalla la conexión de la sección de Eventos (Calendario) con Supabase. La implementación se centró en la precisión temporal de los registros y en replicar el sistema de tolerancia a fallos establecido en el módulo de Cursos, dividiendo la carga lógica entre *Server Components* y *Client Components*.

## Arquitectura y Lógica Implementada

* **Filtrado Cronológico Activo:** Se optimizó la consulta de Prisma aplicando el filtro `where: { date: { gte: new Date() } }`. Esto previene la carga de "eventos zombis" (eventos pasados) y garantiza que la interfaz solo consuma eventos futuros.
* **Ordenamiento Secuencial:** Los registros se extraen ordenados cronológicamente (`orderBy: { date: 'asc' }`) para asegurar que el evento más próximo aparezca de inmediato.
* **Tolerancia a Red (Timeout de 4s):** Se estableció un límite de respuesta de 4 segundos. En caso de fallo, el componente servidor delega un estado `undefined` al componente cliente (`EventsClient`).
* **Activación Reactiva de Mocks:** El componente cliente recibe la data o la falla. Al detectar la ausencia de la base de datos, monta instantáneamente los `mockEvents` para mantener el flujo de navegación del usuario.
* **Gestión de Estados Vacíos:** Si no existen eventos futuros programados, el servidor devuelve un `[]`. La interfaz lo interpreta correctamente y renderiza el diseño de "Aún no hay eventos programados".

## Notas de Infraestructura y CI/CD (Resolución de Error P1012)
Durante la fase de integración continua (CI), se detectó que los workflows de Build Next.js, ESLint, Jest y Playwright fallaban prematuramente con el error de Prisma P1012: The datasource property 'url' is no longer supported in schema files.

**Diagnóstico:**
El cliente de Prisma actualizado requiere acceso simultáneo a dos variables de entorno para compilar correctamente: DATABASE_URL (conexión transaccional) y DIRECT_URL (conexión de sesión). Aunque la base de datos de Maestro Virtual ya contaba con DATABASE_URL en los Secrets del repositorio, carecía de DIRECT_URL. Además, los archivos de configuración YAML no estaban inyectando explícitamente esta nueva variable al entorno virtual de ejecución.

**Solución Implementada:**

* **Actualización de Secrets:** Se agregó de manera segura la variable DIRECT_URL a la bóveda de Actions secrets and variables en la configuración del repositorio.
* **Modificación de Workflows:** Se inyectó la directiva DIRECT_URL: ${{ secrets.DIRECT_URL }} en los bloques de instalación de dependencias de los archivos .github/workflows/ci.yml y .github/workflows/playwright.yml.
* **Recomendación Futura:**
Cualquier compañero que desarrolle módulos nuevos utilizando conexiones directas de Prisma, debe asegurarse de incluir ambas variables de entorno en sus entornos locales (.env.local) y verificar que los workflows de GitHub Actions las reciban correctamente antes de abrir un PR a develop.