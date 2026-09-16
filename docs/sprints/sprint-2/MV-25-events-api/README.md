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