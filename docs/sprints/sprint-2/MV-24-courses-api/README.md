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

## Notas de Infraestructura y CI/CD (Resolución de Error P1012)
Durante la fase de integración continua (CI), se detectó que los workflows de Build Next.js, ESLint, Jest y Playwright fallaban prematuramente con el error de Prisma P1012: The datasource property 'url' is no longer supported in schema files.

### Diagnóstico:
El cliente de Prisma actualizado requiere acceso simultáneo a dos variables de entorno para compilar correctamente: DATABASE_URL (conexión transaccional) y DIRECT_URL (conexión de sesión). Aunque la base de datos de Maestro Virtual ya contaba con DATABASE_URL en los Secrets del repositorio, carecía de DIRECT_URL. Además, los archivos de configuración YAML no estaban inyectando explícitamente esta nueva variable al entorno virtual de ejecución.

### Solución Implementada:

* **Actualización de Secrets:** Se agregó de manera segura la variable DIRECT_URL a la bóveda de Actions secrets and variables en la configuración del repositorio.
* **Modificación de Workflows:** Se inyectó la directiva DIRECT_URL: ${{ secrets.DIRECT_URL }} en los bloques de instalación de dependencias de los archivos .github/workflows/ci.yml y .github/workflows/playwright.yml.
* **Recomendación Futura:** Cualquier compañero que desarrolle módulos nuevos utilizando conexiones directas de Prisma, debe asegurarse de incluir ambas variables de entorno en sus entornos locales (.env.local) y verificar que los workflows de GitHub Actions las reciban correctamente antes de abrir un PR a develop.