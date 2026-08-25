# MV-19: Integración del Servicio de Envío de Correo

**Responsable:** Brandon Alejandro Pedraza Valdez (Equipo de TI - Maestro Virtual A.C.)
**Fecha de implementación:** Agosto 2026
**Sprint:** Sprint 1
**Épica:** Formulario de contacto funcional
**Story Points:** 3

---

## 1. Objetivo

Configurar la cuenta e integrar la base de un servicio de envío de correo transaccional para el proyecto Maestro Virtual, dejando disponible un mecanismo probado de envío desde el backend (Route Handlers de Next.js) que posteriormente será consumido por el formulario de contacto (MV-26) y por los correos de confirmación de inscripciones (MV-38).

---

## 2. Alcance

Durante esta tarea se implementó:

- Selección del proveedor de correo transaccional.
- Alta de cuenta y generación de API Key.
- Instalación del SDK oficial y configuración del cliente.
- Endpoint temporal de prueba para validar el envío en desarrollo.
- Helper reutilizable `sendContactEmail()` para consumir desde otras features.
- Manejo de credenciales mediante variables de entorno.

---

## 3. Proveedor Seleccionado: Resend

Se eligió **Resend** sobre SendGrid por los siguientes motivos:

| Criterio | Resend | SendGrid |
|----------|--------|----------|
| Tier gratuito | 3,000 correos/mes, 100/día | 100 correos/día |
| Integración con Next.js | SDK nativo y ejemplos oficiales | Genérica |
| Onboarding | Cuenta lista en minutos, sin verificación de dominio para pruebas (`onboarding@resend.dev`) | Requiere verificación completa antes de enviar |
| Documentación | Enfocada en stacks modernos (Next.js, React Email) | Amplia pero más orientada a marketing |

Para producción se deberá verificar el dominio propio de Maestro Virtual en el panel de Resend y actualizar el campo `from` en el código.

---

## 4. Arquitectura de la Integración

Al usar Next.js como monorepo full-stack (ver [MV-11](../../sprint-0/MV-11-stack-backend/MV-11-stack-backend.md)), el servicio de correo vive dentro del mismo proyecto:

```
src/
├── lib/
│   └── mail/
│       └── resend.ts              # Cliente Resend (singleton)
├── services/
│   └── mail/
│       └── sendContactEmail.ts    # Helper reutilizable
└── app/
    └── api/
        └── mail/
            └── test/
                └── route.ts       # Endpoint temporal de prueba
```

### Cliente base — `src/lib/mail/resend.ts`

```ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### Endpoint de prueba — `GET /api/mail/test`

Endpoint temporal que dispara un correo de verificación al destinatario configurado en `CONTACT_EMAIL`. Se removerá una vez integrado el formulario real (MV-26).

---

## 5. Variables de Entorno

Las credenciales del servicio **no están hardcodeadas** y se cargan desde `.env.local` (ignorado por git):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `RESEND_API_KEY` | API Key generada desde el panel de Resend | `re_xxxxxxxxxxxxxxxx` |
| `CONTACT_EMAIL` | Destinatario de los correos de contacto y pruebas | `maestrovirtualorg@gmail.com` |

Están declaradas en `.env.example` para que cualquier desarrollador sepa qué configurar al clonar el repositorio.

---

## 6. Cómo Probar en Desarrollo

1. Crear cuenta en [resend.com](https://resend.com) y generar una API Key.
2. Copiar `.env.example` a `.env.local` y rellenar las variables:
   ```bash
   cp .env.example .env.local
   ```
3. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Disparar el endpoint de prueba desde el navegador o `curl`:
   ```
   http://localhost:3000/api/mail/test
   ```
5. Respuesta esperada:
   ```json
   { "success": true, "message": "Email sent successfully", "id": "..." }
   ```
6. Confirmar la recepción del correo en la bandeja de `CONTACT_EMAIL`.

---

## 7. Criterios de Aceptación

- [x] Se puede enviar un correo de prueba exitosamente desde el entorno de desarrollo.
- [x] Las credenciales del servicio están en variables de entorno, no hardcodeadas.

---

## 8. Trabajo Pendiente (fuera del alcance de MV-19)

- **MV-26** — Integrar el helper `sendContactEmail()` con el formulario de contacto real y retirar el endpoint de prueba.
- **MV-38** — Reutilizar la infraestructura para correos de confirmación de inscripciones.
- Verificar dominio propio en Resend antes de pasar a producción y actualizar el `from`.
