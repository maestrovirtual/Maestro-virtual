# MV-24: Courses API Integration & Fallback System

**Responsable:** Juan Pablo Arce Jauregui "Tonpro" (Equipo de TI - Maestro Virtual A.C.)  
**Fecha de decisión:** Septiembre 2026  
**Épica:** Cursos y eventos dinámicos

## Descripción
Este documento detalla la integración del componente de Cursos con la base de datos de Supabase mediante Prisma. El objetivo principal fue establecer una conexión estable y construir una arquitectura tolerante a fallos (*fault-tolerant*) para garantizar la disponibilidad de la interfaz bajo cualquier condición de red.

## Arquitectura y Lógica Implementada

* **Conexión a Base de Datos:** Se reemplazó el consumo estático por consultas dinámicas a la tabla `Course` utilizando Prisma Client.
* **Sistema de Timeout (Red de Seguridad):** Se implementó una carrera de promesas (`Promise.race`) con un límite de tolerancia de 3 segundos. Si la latencia de Supabase supera este límite, la petición se intercepta de manera controlada.
* **Manejo de Fallbacks:** 
  * Si la base de datos falla (caída del servidor o timeout), el sistema devuelve `undefined`, lo que activa automáticamente la carga de datos de respaldo (`mockCourses`).
  * Se utilizó el operador *Nullish Coalescing* (`??`) para asegurar que el sistema sepa diferenciar entre un error de conexión y una respuesta válida sin datos.
* **Soporte para Empty State:** Si la base de datos responde exitosamente pero no hay registros, el sistema respeta el arreglo vacío `[]` y renderiza el diseño oficial de "Aún no hay cursos publicados", evitando inyectar mocks por error.