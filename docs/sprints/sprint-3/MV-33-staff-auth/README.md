# MV-33: Autenticación de staff para el panel

**Responsable:** Eduardo Martinez Soto (Equipo de TI - Maestro Virtual A.C.)
**Fecha de implementación:** Octubre 2026
**Sprint:** Sprint 3
**Épica:** Panel de administración
**Story Points:** 3

---

## 1. Objetivo

Proteger el acceso al panel de administración con un login, de forma que solo usuarios con rol `STAFF` puedan entrar. La autenticación de usuarios finales (registro, recuperación de contraseña) pertenece a MV-36 (Sprint 4) y no se implementa aquí.

**Criterio de aceptación:** un usuario sin rol staff no puede acceder a las rutas del panel, ni escribiendo la URL directamente.

---

## 2. Alcance

Incluye:

- Login y logout de staff (`/[locale]/staff/login`, `POST /api/auth/login`, `POST /api/auth/logout`).
- Protección de todas las rutas `/[locale]/admin/**`.
- Protección de las operaciones de escritura de cursos y eventos (POST, PUT, DELETE).
- Script `npm run staff:create` para dar de alta usuarios staff.
- Botón «Cerrar Sesión» del panel conectado al logout.

No incluye (otras tareas):

- Registro, recuperación de contraseña y sesión de usuarios finales (MV-36).
- Pantallas y formularios del panel (MV-30, MV-31, MV-32) ni la bandeja de mensajes (MV-34).
- Límite de intentos de login (rate limiting).

---

## 3. Decisión: autenticación propia en lugar de Supabase Auth

El documento de [MV-11](../../sprint-0/MV-11-stack-backend/MV-11-stack-backend.md) menciona «Supabase Auth», pero el resto del proyecto apunta a autenticación propia:

| Evidencia | Qué indica |
|-----------|------------|
| Especificación de la tarea 2 (modelo de datos): «usuarios (nombre, correo, contraseña hasheada, rol)» | Credenciales guardadas en nuestra propia tabla |
| MV-12 / MV-17: `User.hashedPassword` (`NOT NULL`) y `enum Role { USER, STAFF }` ya migrados | El esquema está diseñado para autenticación propia |
| MV-11 elige la opción 3 (Route Handlers + Prisma) y descarta «Supabase BaaS» por menos control | Arquitectura con control propio |
| Ningún código usa `supabase.auth`, `auth.users` ni `@supabase/*` | Supabase se usa solo como hosting de PostgreSQL |

Usar Supabase Auth habría obligado a migrar `User` (quitar `hashedPassword`, vincular con `auth.users`) y a sincronizar dos tablas de usuarios. Con autenticación propia no hay migraciones y solo se agrega una dependencia (`jose`).

---

## 4. Arquitectura

```
Navegador ──► src/proxy.ts ──► [locale]/admin/layout.tsx ──► páginas del panel
               │  1ª barrera        2ª barrera (respaldo)
               │  - decodifica la URL
               │  - ¿/<idioma>/admin/**?
               │  - firma de la cookie + rol STAFF en BD
               │  - si no: 307 → /<idioma>/staff/login
               └─► next-intl (solo "/" y "/(es|en)/...", igual que antes)

API de escritura ──► requireStaffApi() ──► 401 sin sesión / 403 sin rol STAFF
```

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/lib/auth/password.ts` | Hash y verificación con `scrypt` de Node (parámetros OWASP: N=2^17, r=8, p=1). Formato `scrypt$N$r$p$salt$hash`. |
| `src/lib/auth/session.ts` | Token JWT HS256 firmado con `jose` y `AUTH_SECRET`, guardado en la cookie `mv_staff_session` (`HttpOnly`, `SameSite=Lax`, `Secure` en producción, 8 horas). |
| `src/lib/auth/staff.ts` | `checkStaffToken()`: valida la firma **y** vuelve a leer el rol en la base de datos. |
| `src/lib/auth/dal.ts` | `getStaffUser()` para páginas y `requireStaffApi()` para Route Handlers. |
| `src/proxy.ts` | Barrera principal del panel, antes de next-intl. |
| `src/app/[locale]/admin/layout.tsx` | Respaldo que vuelve a validar la sesión. |
| `src/app/[locale]/staff/login/page.tsx` + `src/features/auth/StaffLoginForm.tsx` | Pantalla de login. |
| `src/app/api/auth/login` y `logout` | Emiten y borran la cookie de sesión. |

### Por qué el proxy es la barrera principal

Next.js renderiza layouts y páginas **en paralelo**. Si solo el layout redirige, el contenido de la página igual viaja en la respuesta. Por eso el proxy:

- cubre cualquier ruta que resuelva a `[locale]/admin` (incluidas `/fr/admin` y URLs codificadas como `/es/%61dmin`);
- vuelve a leer el rol en la base de datos, así que a un staff al que le quitan el rol se le bloquea antes de renderizar.

### Mensajes de error del login

Correo inexistente, contraseña incorrecta y usuario sin rol staff responden el mismo `401 "Correo o contraseña incorrectos"`, para no revelar qué cuentas existen.

---

## 5. Variables de entorno

| Variable | Uso |
|----------|-----|
| `AUTH_SECRET` | Firma las sesiones. Mínimo 32 caracteres. Generar con `openssl rand -base64 32`. |

- Se lee en tiempo de ejecución: el build **no** la necesita.
- Si falta o es corta, nadie puede iniciar sesión (falla cerrado).
- **Debe configurarse en Vercel** (preview/staging y producción) antes de usar el panel desplegado.
- Cambiarla invalida todas las sesiones activas.

---

## 6. Dar de alta un usuario staff

No existe registro público de staff. Desde una terminal interactiva:

```bash
npm run staff:create
# o con datos por argumento:
npm run staff:create -- --email ana@maestrovirtual.org --name "Ana López"
```

- La contraseña se pide oculta (mínimo 12 caracteres) y se pide confirmar.
- Si el correo ya existe, el usuario se promueve a `STAFF` y su contraseña se reemplaza.
- El usuario se crea en la base de datos de `DATABASE_URL` del `.env`.
- Sin terminal interactiva (por ejemplo, en scripts) se puede usar la variable `STAFF_PASSWORD`.

---

## 7. Trabajar en el panel en local

Desde MV-33, `/es/admin` exige sesión. Para desarrollar pantallas del panel:

1. Agregar `AUTH_SECRET` al `.env` local (cualquier valor de 32+ caracteres).
2. Tener un usuario staff en la base de datos a la que apunta el `.env` (ver sección 6).
3. Entrar en `/es/staff/login`.

---

## 8. Para tareas futuras

- **MV-31 / MV-32 / MV-34:** las páginas del panel que lean datos reales deben verificar la sesión junto a la consulta (`getStaffUser()`), no confiar solo en el layout. Los Route Handlers nuevos del panel deben empezar con:
  ```ts
  const denied = await requireStaffApi();
  if (denied) return denied;
  ```
- **MV-36:** `password.ts` y `session.ts` son reutilizables para usuarios finales; el rol ya viaja en el token.

---

## 9. Pruebas

| Tipo | Archivo | Qué cubre |
|------|---------|-----------|
| Unitarias | `__tests__/auth/password.test.ts` | Hash, verificación, salt, formatos inválidos |
| Unitarias | `__tests__/auth/session.test.ts` | Firma, token alterado, otro secreto, expirado, rol inválido, sin `AUTH_SECRET` |
| Unitarias | `__tests__/auth/dal.test.ts` | 401/403, usuario borrado o degradado |
| Unitarias | `__tests__/proxy.test.ts` | Redirecciones del panel, variantes de URL, rutas públicas sin cambios |
| API | `__tests__/api/auth.test.ts` | Login (400/401/200/500) y logout |
| API | `__tests__/api/courses*.test.ts`, `events*.test.ts` | 401/403 en POST, PUT y DELETE; flujo staff |
| E2E | `e2e-tests/staff-auth.spec.ts` | Criterio de aceptación: URL directa → login |
