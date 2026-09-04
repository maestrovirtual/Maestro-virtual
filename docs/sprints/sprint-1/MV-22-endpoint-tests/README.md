🧪 Pruebas Unitarias para Endpoints de API (/api/courses y /api/events)

📌 Resumen de Cambios

Se implementó la suite de pruebas unitarias para los controladores de la API (/api/courses y /api/events) en Next.js (App Router), garantizando la validación de respuestas HTTP, manejo de errores y lógica de negocio sin depender de una base de datos real.

🛠️ Aspectos Técnicos Destacados
Entorno Node: Uso de la directiva /** @jest-environment node */ para proveer acceso nativo a las Web APIs (Request, Response, Headers) dentro de Jest.

Aislamiento con Mocks: Simulación del cliente de Prisma (@/lib/prisma/client) para probar la lógica de las rutas en milisegundos sin conectarse a la base de datos.

Limpieza de Logs: Implementación de jest.spyOn(console, 'error') en pruebas de fallos simulados (500) para mantener la salida de la terminal limpia de trazas de error esperadas.

📋 Cobertura de Pruebas
1. Cursos (__tests__/api/courses.test.ts)
GET /api/courses

200 OK: Retorna la lista de cursos activos filtrados por isActive: true e incluye testimonios.

500 Internal Server Error: Captura errores en la consulta de la BD.

POST /api/courses

400 Bad Request: Valida la presencia obligatoria de title y slug.

201 Created: Verifica la creación exitosa asignando valores predeterminados.

500 Internal Server Error: Manejo de errores durante la inserción en la BD.

2. Eventos (__tests__/api/events.test.ts)
GET /api/events

200 OK: Retorna los eventos activos ordenados cronológicamente (date: asc).

500 Internal Server Error: Captura errores de lectura en la BD.

POST /api/events

400 Bad Request: Valida los campos obligatorios (title, date, modality).

201 Created: Confirma la creación del evento mapeando modalidades (IN_PERSON / ONLINE).

500 Internal Server Error: Manejo de errores durante la inserción en la BD.