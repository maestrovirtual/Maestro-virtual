Pruebas de Integración Frontend-Backend (e2e-tests/integration.spec.ts)

Resumen de Cambios

- Se implementó la suite de pruebas de integración End-to-End (E2E) con Playwright para verificar la comunicación directa entre la interfaz de usuario, los endpoints de la API y la base de datos (Prisma).

- Además, se eliminó el archivo antiguo contact.spec.ts por redundancia, unificando todo el flujo de integración en una sola suite limpia y mantenible.


Aspectos Técnicos Destacados

- Soporte para i18n ([locale]): Navegación explícita mediante prefijos de idioma (/es/courses, /es/contact) para evitar fallos por redirección dinámica del middleware de Next.js.

- Sincronización de Carga: Uso de waitForLoadState('domcontentloaded') y esperas explícitas de elementos dinámicos para garantizar el renderizado de datos traídos desde la base de datos.

- Limpieza de Suite E2E: Eliminación de selectores obsoletos e inestables basados en tiempos fijos (waitForTimeout), reemplazándolos por aserciones Reactivas de Playwright (expect().toBeVisible()).


Cobertura de Pruebas

Flujos de Integración Automatizados
1. Cargar la lista de cursos:

- Navega a la vista general de cursos (/es/courses).

- Valida la consulta e integración con la API/BD verificando la renderización dinámica de las tarjetas de cursos.

2. Cargar un curso específico:

- Selecciona el primer curso de la lista y realiza clic hacia su vista detallada.

- Valida la redirección dinámica hacia /es/courses/[slug] y confirma la presencia del encabezado del curso.

3. Enviar el formulario de contacto:

- Navega a la sección de contacto (/es/contact).

- Completa los campos interactivos (name, email, message) y ejecuta el envío.

- Confirma que el servidor procese la petición sin generar excepciones o errores de servidor (500).



Comandos de Ejecución

1. Ejecutar la prueba de integración en modo headless (consola):

PowerShell
npx playwright test e2e-tests/integration.spec.ts

2. Ejecutar la prueba con interfaz visual interactiva (UI):

PowerShell
npx playwright test e2e-tests/integration.spec.ts --ui