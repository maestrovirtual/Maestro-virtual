# MV-41: Pruebas E2E del flujo de inscripción

**Responsable:** Leo (QA)
**Sprint:** Sprint 4
**Épica:** QA, accesibilidad y performance
**Story Points:** 8

---

## 1. Objetivo

Probar de punta a punta, de forma automática y en un navegador real, el flujo que recorre una persona para inscribirse: registro → inicio de sesión → inscripción a un curso o evento. Valida lo construido en [MV-36](../MV-36-user-auth/README.md) (autenticación de usuarios finales) y MV-37 (flujo de inscripción).

**Criterio de aceptación:** el flujo completo se prueba automáticamente y cubre tanto el camino exitoso como errores comunes (por ejemplo, inscribirse sin estar logueado).

---

## 2. Alcance

Incluye:

- Un archivo de pruebas Playwright: `e2e-tests/enrollment-flow.spec.ts`, con dos pruebas (curso y evento).
- **Camino exitoso:** registro (o inicio de sesión si la cuenta ya existe), inscripción con modal de confirmación, cierre de sesión, nuevo inicio de sesión y verificación de que la inscripción se conserva.
- **Error común:** un visitante sin sesión que intenta inscribirse (curso y evento) es enviado a `/es/login?next=<ruta de origen>`.
- Una cuenta de pruebas fija, para no crear un usuario nuevo en cada corrida.
- Limpieza automática de las inscripciones de esa cuenta antes de correr, para que la inscripción se ejecute de verdad cada vez.
- Esta documentación.

---

## 3. Decisiones

| Decisión | Por qué |
|----------|---------|
| Playwright | El proyecto ya lo usa (`e2e-tests/staff-auth.spec.ts`, `playwright.config.ts`). No se agrega ninguna dependencia. |
| Un solo archivo, sin cambios en `playwright.config.ts` | Menor superficie de cambio. Sigue el estilo del equipo: nombres «Debe…», espera del `.app-splash-overlay` y textos exactos de la interfaz. |
| Cuenta fija en lugar de crear un usuario por corrida | Evita llenar la base de datos compartida. El test intenta registrarla; si la API responde `409` (ya existe), solo inicia sesión. |
| Borrar con Prisma las inscripciones de la cuenta fija antes de correr | La inscripción deja estado: sin limpiar, desde la segunda corrida el curso mostraría «Ya estás inscrito» y no se probaría la inscripción. Solo se tocan las inscripciones de esa cuenta. |
| Si la limpieza falla, la prueba continúa y lo avisa | Se agrega la anotación «Ya estaba inscrito antes de empezar» en el reporte. La prueba no se cuelga, pero ese caso solo verifica el estado, no la inscripción. |
| Registro por la interfaz y no por la API | El criterio pide probar el flujo completo, incluyendo el formulario. |
| Prueba de evento con salto automático si no hay eventos | La prueba no debe fallar por falta de datos. Si `/es/events` dice «Aún no hay eventos programados», se salta con un aviso. |
| `slowMo` de 700 ms y 120 s de límite por prueba | Permite ver el proceso en pantalla y da margen a la base de datos remota. Con el límite por defecto (30 s) las corridas se cortaban. |

---

## 4. Arquitectura

### Flujo de la prueba 1 (curso)

```
Visitante ──► /es/courses/aprendiendo-tecnologias ──► clic en inscribirse ──► /es/login?next=…   (error común)

/es/register?next=<curso> ──► POST /api/account/register
        ├─ 201 → queda con sesión y vuelve al curso
        └─ 409 → /es/login?next=<curso> → inicia sesión → vuelve al curso

Curso ──► «Inscribirme» ──► modal ──► «Confirmar Inscripción» ──► «Ya estás inscrito»
«Hola, E2E» ──► «Cerrar sesión» ──► /es/login ──► inicia sesión ──► el curso sigue «Ya estás inscrito»
```

### Flujo de la prueba 2 (evento)

```
Visitante ──► /es/events ──► clic en inscribirse ──► /es/login?next=…
/es/login?next=/es/events ──► inicia sesión ──► primer evento de la lista ──► modal ──► «Ya estás inscrito» (también tras recargar)
```

### Archivos

| Archivo | Responsabilidad |
|---------|-----------------|
| `e2e-tests/enrollment-flow.spec.ts` | Las dos pruebas, los helpers (`esperarSplash`, `iniciarSesion`, `inscribirse`) y la limpieza previa. |
| `playwright.config.ts` | Sin cambios. Levanta `npm run dev` si no hay servidor y usa `http://localhost:3000`. |

### Detalles de la implementación

- **Pruebas en serie** (`mode: 'serial'`): las dos comparten la misma cuenta y no deben correr en paralelo.
- **Limpieza (`beforeAll`):** carga el `.env` con `process.loadEnvFile('.env')` (Playwright no lo lee por sí solo) y ejecuta `prisma.enrollment.deleteMany` solo para el correo de la cuenta de pruebas. El cliente se importa de `src/lib/prisma/client`; como Playwright compila a CommonJS, el helper busca el cliente en `default`, `default.default` o `prisma`.
- **Helper `inscribirse()`:** espera a que aparezca el botón de inscribirse o el texto «Ya estás inscrito» (la página puede estar en carga) y después decide. Devuelve `true` si realmente se inscribió.
- **Cuenta de pruebas:** correo `delivered@resend.dev`, nombre «E2E Fijo». Las credenciales están en la constante `USER` del archivo.

### Textos de la interfaz en los que se apoyan los selectores

| Elemento | Texto |
|----------|-------|
| Botón que abre el modal | Contiene «inscrib» / «inscríb» (Inscribirme, Inscribirse, Inscríbete) |
| Botón del modal | `Confirmar Inscripción` |
| Estado inscrito | `Ya estás inscrito` |
| Mensaje de éxito (curso) | `Te has inscrito al curso con éxito` |
| Saludo del Navbar | `Hola, E2E` |
| Registro | Campos «Nombre», «Correo», «Contraseña», «Confirma tu contraseña»; botón «Crear cuenta» |
| Login | Campos «Correo» y «Contraseña»; botón «Iniciar sesión» |
| Cierre de sesión | `Cerrar sesión` |
| Lista de eventos vacía | `Aún no hay eventos programados` |

Si cambia alguno de estos textos, hay que actualizar el archivo.

---

## 5. Qué cubre cada prueba

| Prueba | Paso | Verifica |
|--------|------|----------|
| Curso | Error común | Visitante sin sesión → `/es/login?next=` |
| Curso | Registro o login | La API responde `201` o `409`; con `409` inicia sesión; regresa al curso y el Navbar muestra «Hola, E2E» |
| Curso | Inscripción | Modal → «Confirmar Inscripción» → mensaje de éxito, «Ya estás inscrito» y ya no hay botón de inscribirse |
| Curso | Cierre de sesión | «Hola, E2E» → «Cerrar sesión» → `/es/login` |
| Curso | Nuevo login | Inicia sesión otra vez y el curso sigue mostrando «Ya estás inscrito» |
| Evento | Salto condicional | Si no hay eventos publicados, la prueba se salta con aviso |
| Evento | Error común | Visitante sin sesión → `/es/login?next=` |
| Evento | Login | Inicia sesión y regresa a `/es/events` |
| Evento | Inscripción | Primer evento de la lista → modal → «Ya estás inscrito», también tras recargar |

---

## 6. Variables de entorno y requisitos previos

No hay variables nuevas. Se usan las existentes en el `.env` de la raíz del proyecto (junto a `package.json`):

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | La app y la limpieza de inscripciones. |
| `DIRECT_URL` | Migraciones (`prisma migrate`). |
| `AUTH_SECRET` | Firma de las sesiones (mínimo 32 caracteres). |

Requisitos:

1. Node con soporte de `process.loadEnvFile` (20.12 o superior).
2. Base de datos con las migraciones aplicadas: `npx prisma migrate deploy` (debe decir «Database schema is up to date»).
3. Cliente de Prisma actualizado: `npx prisma generate` (se ejecuta con `npm install`). Si falta, la app responde con errores como `Unknown field passwordChangedAt`.
4. Navegadores de Playwright instalados: `npx playwright install chromium`.
5. Al menos un curso publicado con el slug `aprendiendo-tecnologias` (constante `COURSE_PATH`).
6. Opcional: al menos un evento publicado para que corra la prueba de evento.

---

## 7. Cómo ejecutar

```bash
# Ver el proceso en el navegador
npx playwright test enrollment-flow --headed

# Modo interfaz de Playwright (línea de tiempo, pausar, repetir)
npx playwright test enrollment-flow --ui

# Salida en consola (muestra también los avisos de la limpieza)
npx playwright test enrollment-flow --reporter=list
```

Cómo leer el resultado:

- Si la anotación **«Ya estaba inscrito antes de empezar»** aparece en el reporte, la limpieza no pudo borrar y la prueba solo verificó el estado. Revisar en la consola el aviso `No se pudo limpiar las inscripciones previas`.
- **En CI las pruebas se saltan** (`test.skip(!!process.env.CI)`) porque no hay base de datos disponible, igual que el resto del proyecto, que simula la API en `staff-auth.spec.ts`.
- **Límites por IP de MV-36:** registro 5 por hora y login 10 por 15 minutos. Cada corrida usa 1 intento de registro y hasta 3 inicios de sesión. Si aparece un `429`, reiniciar `npm run dev` (el límite vive en memoria).
- En local, sin `RESEND_API_KEY`, la terminal del servidor muestra `Error enviando correo de confirmación de inscripción`. No afecta al test: la inscripción se guarda igual.


## 8. Pruebas

| Tipo | Archivo | Qué cubre |
|------|---------|-----------|
| E2E | `e2e-tests/enrollment-flow.spec.ts` | Registro/login, inscripción a curso y evento, cierre de sesión, nuevo login y error de inscribirse sin sesión |

**Última ejecución local** (`npx playwright test enrollment-flow --reporter=list`): 1 prueba pasó (curso, 28.7 s), 1 se saltó (evento, sin eventos publicados). Total 44.1 s.

