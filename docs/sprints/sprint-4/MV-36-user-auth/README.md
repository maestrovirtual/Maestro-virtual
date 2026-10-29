# MV-36: Autenticación de usuarios finales

**Responsable:** Eduardo Martinez Soto (Equipo de TI - Maestro Virtual A.C.)
**Fecha de implementación:** Octubre 2026
**Sprint:** Sprint 4
**Épica:** Autenticación de usuarios
**Story Points:** 8

---

## 1. Objetivo

Registro, inicio y cierre de sesión, y recuperación de contraseña para las personas que quieran inscribirse a cursos y eventos. Es independiente del login de staff de [MV-33](../../sprint-3/MV-33-staff-auth/README.md).

**Criterio de aceptación:** un usuario puede registrarse, cerrar sesión, volver a iniciar sesión y recuperar su contraseña vía correo si la olvida.

---

## 2. Alcance

Incluye:

- Páginas `/[locale]/login`, `/[locale]/register`, `/[locale]/forgot-password` y `/[locale]/reset-password`.
- API `POST /api/account/register`, `login`, `logout`, `password/forgot` y `password/reset`.
- Correo de recuperación por Resend con enlace de un solo uso (vence en 1 hora).
- Botón «Iniciar sesión» del Navbar conectado a `/login`; con sesión muestra «Hola, {nombre}» y lleva a la cuenta.
- `getCurrentUser()` para que otras tareas sepan quién está conectado.

No incluye (otras tareas):

- Inscripción a cursos y eventos (MV-37) ni el dashboard «mis cursos» (MV-39). Mientras no exista el dashboard, `/login` muestra la cuenta y el botón «Cerrar sesión» cuando ya hay sesión.
- Correos de confirmación de inscripción (MV-38) y pruebas E2E del flujo (MV-41).
- Verificación del correo al registrarse y menú móvil del Navbar (hoy el botón de menú en móvil no abre nada).

---

## 3. Decisiones

| Decisión | Por qué |
|----------|---------|
| Reutilizar la autenticación propia de MV-33 (`scrypt` + JWT con `jose`) | Misma tabla `User`, sin dependencias nuevas ni Supabase Auth. |
| Cookie propia `mv_user_session` (7 días), separada de `mv_staff_session` (8 horas) | Una sesión de usuario nunca abre el panel y una de staff nunca cuenta como usuario: el rol del token debe coincidir con la cookie. |
| El login y la recuperación públicos solo aceptan cuentas `USER` | El staff entra por `/staff/login` y su contraseña se administra con `npm run staff:create`. |
| Tabla `PasswordResetToken` con el hash SHA-256 del token | Con una copia de la base de datos no se pueden usar los enlaces. |
| `User.passwordChangedAt` | Al restablecer la contraseña se cierran las sesiones abiertas en otros dispositivos. |
| Registro responde `409` si el correo ya existe | Para una persona sin conocimientos técnicos es más claro que un mensaje genérico. Por eso «olvidé mi contraseña» no intenta ocultar más de lo que ya revela el registro, aunque sí responde igual para correos sin cuenta y de staff. |
| Límite por IP en memoria (login 10 / 15 min, registro 5 / hora, recuperación 5 / 15 min) | Mismo enfoque que `/api/contact`: frena fuerza bruta simple. Es por instancia del servidor, no global. |

---

## 4. Arquitectura

```
/login, /register ──► /api/account/login | register ──► cookie mv_user_session (JWT, rol USER)
                                                          │
Páginas y API de MV-37 / MV-39 ──► getCurrentUser() ──────┘ firma + usuario en BD
                                                            + sesión posterior a passwordChangedAt

/forgot-password ──► /api/account/password/forgot ──► PasswordResetToken (hash, 1 h) ──► correo con enlace
/reset-password?token=… ──► /api/account/password/reset ──► nueva contraseña + passwordChangedAt
```

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/lib/auth/session.ts` | Agrega `USER_SESSION_COOKIE`, la duración por parámetro y `verifySessionClaims()` (incluye `issuedAt`). `verifySessionToken()` sigue igual para el staff. |
| `src/lib/auth/user.ts` | `checkUserToken()`: firma, rol `USER`, usuario en BD y sesión emitida después del último cambio de contraseña. |
| `src/lib/auth/dal.ts` | `getCurrentUser()` para páginas, junto a `getStaffUser()`. |
| `src/lib/auth/account.ts` | Reglas compartidas por formularios y API: correo, contraseña (8 a 128 caracteres), nombre y `safeNextPath()`. |
| `src/lib/auth/password-reset.ts` | Generación y hash del token, vigencia y origen del enlace. |
| `src/lib/auth/rate-limit.ts` | Límite de peticiones por IP. |
| `src/services/mail/sendPasswordResetEmail.ts` | Correo de recuperación (texto + HTML). |
| `src/app/api/account/**` | Endpoints de la sección 5. |
| `src/app/[locale]/(public)/(account)/**` + `src/features/account/**` | Páginas y formularios. |
| `src/app/[locale]/(public)/layout.tsx` + `src/components/layout/Navbar.tsx` | El layout público pasa el nombre del usuario al Navbar. Sin cookie de sesión no se consulta la base de datos. |

### Enlace de recuperación

- El token tiene 256 bits aleatorios. En la base solo queda su hash, y al pedir otro enlace se borran los anteriores.
- Al usarse se marca de forma atómica (`updateMany` con `usedAt: null`): si el enlace se envía dos veces a la vez, solo una petición cambia la contraseña.
- El origen del enlace sale de `NEXT_PUBLIC_APP_URL` o, en Vercel, de `VERCEL_URL`. **Nunca del `Host` de la petición en producción**: si no, alguien podría pedir el enlace de otra persona con un Host falso y recibir el token en su dominio. En desarrollo se usa el origen local.
- La página `/reset-password` usa `referrer: no-referrer` y `noindex` para que el token no se filtre.

### Redirección después del login (`?next=`)

`/login?next=/es/courses/excel` regresa a esa ruta después de entrar o registrarse. `safeNextPath()` solo acepta rutas del mismo sitio (rechaza `//otro.sitio`, `/\otro.sitio`, URLs absolutas). La ruta debe incluir el idioma.

---

## 5. API

| Método y ruta | Cuerpo | Respuestas |
|---------------|--------|------------|
| `POST /api/account/register` | `{ name, email, password }` | `201` + cookie · `400` datos inválidos · `409` correo ya registrado · `429` |
| `POST /api/account/login` | `{ email, password }` | `200` + cookie · `400` · `401 "Correo o contraseña incorrectos"` · `429` |
| `POST /api/account/logout` | formulario con `locale` | `303` → `/<locale>/login` y borra la cookie |
| `POST /api/account/password/forgot` | `{ email, locale }` | `200` mismo mensaje exista o no la cuenta · `400` · `429` · `502` no se pudo enviar el correo · `503` falta `NEXT_PUBLIC_APP_URL` |
| `POST /api/account/password/reset` | `{ token, password }` | `200` y borra la cookie · `400 "El enlace no es válido o ya expiró"` |

---

## 6. Base de datos

Migración `prisma/migrations/20261028000000_user_password_reset`:

- `User.passwordChangedAt` (`TIMESTAMP`, opcional).
- Tabla `PasswordResetToken` (`tokenHash` único, `userId` con `ON DELETE CASCADE`, `expiresAt`, `usedAt`, `createdAt`).

Solo agrega columnas y tablas; no modifica datos existentes. Se aplica con `npx prisma migrate deploy`.

---

## 7. Variables de entorno

No hay variables nuevas. Se usan las que ya existían:

| Variable | Uso en MV-36 |
|----------|--------------|
| `AUTH_SECRET` | Firma las sesiones de usuario (la misma que la del staff). |
| `RESEND_API_KEY`, `MAIL_FROM` | Envío del correo de recuperación. Sin `MAIL_FROM` se usa `onboarding@resend.dev`, que solo entrega al dueño de la cuenta de Resend. |
| `MAIL_REPLY_TO` / `CONTACT_EMAIL` | Opcional: a dónde llegan las respuestas al correo de recuperación. |
| `NEXT_PUBLIC_APP_URL` | Origen de los enlaces del correo. **Configurarla en producción en Vercel** (por ejemplo `https://maestrovirtual.org`). |

---

## 8. Probarlo en local

1. Aplicar la migración a la base del `.env`: `npx prisma migrate deploy`.
2. `npm run dev` y abrir `/es/register`: crear una cuenta (queda la sesión iniciada).
3. Abrir `/es/login`: aparece «Ya iniciaste sesión» con el botón «Cerrar sesión».
4. Cerrar sesión y volver a entrar con el mismo correo y contraseña.
5. En `/es/forgot-password`, pedir el enlace con un correo que pueda recibir mensajes de la cuenta de Resend configurada, abrirlo y elegir una contraseña nueva.

---

## 9. Para tareas futuras

- **MV-37 (inscripciones):** `const user = await getCurrentUser()` (de `@/lib/auth/dal`) funciona en páginas y en Route Handlers; `null` significa sin sesión (responder `401` en la API). En páginas, mandar a `/<locale>/login?next=<ruta actual>`.
- **MV-39 (dashboard):** el círculo de perfil del Navbar sigue con «Próximamente»; es el lugar natural para «Mi cuenta». El «Cerrar sesión» de `SignedInCard` puede moverse ahí.
- **MV-41 (E2E):** registro → logout → login → recuperación. Para el correo, revisar el envío en el panel de Resend o simular la API.

---

## 10. Pruebas

| Tipo | Archivo | Qué cubre |
|------|---------|-----------|
| API | `__tests__/api/account.test.ts` | Registro (400/409/201/429, hash, cookie de usuario), login (401 para staff, 200, 429) y logout |
| API | `__tests__/api/account-password.test.ts` | Recuperación: respuesta genérica, cooldown, solo hash en BD, origen del enlace, fallo de correo, `503`; restablecer: token inválido/usado/expirado/de staff, cambio atómico, invalidación de sesiones |
| Unitarias | `__tests__/auth/user.test.ts` | `checkUserToken()` y `getCurrentUser()`: rol, usuario borrado, sesión anterior al cambio de contraseña, cookie equivocada |
| Unitarias | `__tests__/auth/account.test.ts` | Reglas de correo y contraseña, `safeNextPath()` contra redirecciones abiertas, límite por IP |
