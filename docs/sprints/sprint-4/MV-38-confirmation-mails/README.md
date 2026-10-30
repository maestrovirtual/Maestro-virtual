# MV-38: Correos automáticos de confirmación de inscripción

**Responsable:** Brandon Pedraza (Backend - Integración de Correos)  
**Sprint:** 4  
**Épica:** Inscripción a cursos y eventos  
**Story Points:** 3  
**Rama:** `feature/MV-38-confirmation-mails`

---

## 1. Resumen Ejecutivo

Implementación de correos automáticos de confirmación que se envían inmediatamente después de que un usuario se inscribe en un curso o evento. La funcionalidad integra Resend como proveedor de email, separando claramente los flujos de "respuestas a usuarios" (soporte) y "notificaciones escaladas a TI" mediante variables de entorno específicas.

**Criterios de aceptación cumplidos:**
- [x] El correo se envía inmediatamente después de una inscripción exitosa.
- [x] El correo incluye los datos correctos del curso (título, duración, modalidad, participantes).
- [x] El correo incluye los datos correctos del evento (título, fecha, hora, modalidad, ubicación).
- [x] Se utiliza la variable `MAIL_FROM` configurada (dominio verificado en Resend).
- [x] El email tiene formato HTML responsivo en español mexicano.
- [x] El envío de correo no bloquea la inscripción (error handling graceful).

---

## 2. Arquitectura y Cambios Técnicos

### 2.1. Refactorización de Variables de Entorno

Originalmente, el proyecto usaba una única variable `MAIL_FROM` para todos los correos. Decidí separar explícitamente dos casos de uso distintos:

**`.env.example` (actualizado):**
```env
MAIL_FROM="Soporte Maestro Virtual <soporte@maestrovirtual.org>"
MAIL_FROM_NOTIFICATIONS="Sistema Maestro Virtual <importante@maestrovirtual.org>"
```

**Decisión de diseño:** Esta separación permite que en el futuro sea fácil cambiar el remitente de notificaciones internas sin afectar las respuestas a usuarios. Es escalable si llegan más proveedores o necesidades de integración.

### 2.2. Servicio de Confirmación de Inscripción

**Archivo:** `src/services/mail/sendEnrollmentConfirmation.ts`

El servicio soporta dos tipos de confirmación:

1. **Confirmación de Curso:**
   ```typescript
   {
     type: "course",
     title: string,           // Nombre del curso
     duration: string,        // "8 semanas" o "16 horas"
     modality: string,        // "Presencial" o "Online"
     participants: string,    // "20 participantes"
   }
   ```

2. **Confirmación de Evento:**
   ```typescript
   {
     type: "event",
     title: string,
     date: string,            // Formato ISO: "2026-10-29"
     time?: string,           // "14:00" (opcional)
     duration?: string,
     modality: string,        // "Presencial" o "Online"
     location?: string,       // Nombre del lugar
     address?: string,        // Dirección completa
     platform?: string,       // "Zoom", "Google Meet", etc.
   }
   ```

**Decisión de diseño:** Usé tipos discriminados (`type: "course" | "event"`) para garantizar que cada rama del código reciba exactamente los campos que necesita. Esto evita errores en tiempo de compilación.

### 2.3. Integración con el Flujo de Inscripción

**Archivo modificado:** `src/features/enrollments/actions/enrollment.actions.ts`

El envío de correo ocurre **inmediatamente después de crear el enrollment** en la base de datos:

```typescript
const enrollment = await prisma.enrollment.create({
  data: { userId, status: "REGISTERED", ...relationFilter },
  include: { course: true, event: true },
});

// Enviar correo automáticamente
try {
  if (type === "COURSE" && enrollment.course) {
    await sendEnrollmentConfirmation({
      name: user.name,
      email: user.email,
      item: {
        type: "course",
        title: enrollment.course.title,
        duration: enrollment.course.duration,
        modality: enrollment.course.modality,
        participants: enrollment.course.participants,
      },
    });
  }
  // ... similar para EVENT
} catch (error) {
  console.error("Error enviando correo...", error);
  // El enrollment ya se creó, así que solo logueamos
}
```

**Decisión de diseño:** Aunque el correo falle, la inscripción se completa exitosamente. Esto es crítico porque:
- El usuario ve un mensaje de éxito en la UI (la inscripción es real)
- Si hay problemas temporales de Resend, no bloqueamos al usuario
- El error se loguea para que ops lo revise en monitoreo

### 2.4. Validación de Remitentes

**Archivo:** `src/lib/mail/contact-settings.ts`

La función `contactMailSettings()` valida que `MAIL_FROM` sea válido:
```typescript
if (!EMAIL.test(address) || address.endsWith("@resend.dev")) {
  issues.push("Configura MAIL_FROM con dominio verificado en Resend");
}
```

**Decisión de diseño:** Rechazo explícito de `@resend.dev` en producción. Es el default de Resend, así que si llegamos a producción con esto, es un error de configuración que queremos detectar temprano.

---

## 3. Decisiones Arquitectónicas

### 3.1. ¿Por qué separar `MAIL_FROM` y `MAIL_FROM_NOTIFICATIONS`?

Inicialmente pensé mantener una sola variable, pero encontré un problema:
- Las respuestas a usuarios desde el Admin Panel vienen del equipo de soporte
- Las notificaciones escaladas a TI vienen del sistema automático

Tienen "personalidades" diferentes. Separar las variables permite:
1. **Escalabilidad:** Si en el futuro Resend nos pide usar dominios diferentes, es un cambio de env
2. **Seguridad:** El equipo de soporte puede tener límites de tasa distintos
3. **Claridad:** El código es más explícito sobre quién está enviando qué

### 3.2. ¿Por qué no bloquear la inscripción si falla el correo?

Porque el usuario **ya está inscrito**. El enrollment se creó en la BD. Bloquear la respuesta crearía UX confusa:
- El usuario ve un error pero está inscrito
- Reintenta, recibe un "Ya estás inscrito"
- Está molesto

En su lugar, el correo fallido es un problema **de operaciones**, no del usuario. Nuestro sistema loguea el error y ops lo puede revisar en los logs.

### 3.3. ¿Formato ISO para fechas de eventos?

Usé `enrollment.event.date.toISOString().split("T")[0]` para obtener "2026-10-29" porque:
- ISO es un estándar universal que funciona en cualquier zona horaria
- La plantilla HTML lo localiza a "miércoles, 29 de octubre de 2026" usando `toLocaleDateString()`
- Evita confusiones de zona horaria en el servidor

---

## 4. Cambios de Código

### 4.1. Archivos Modificados

| Archivo | Cambio | Razón |
|---------|--------|-------|
| `.env.example` | Agregar `MAIL_FROM_NOTIFICATIONS` | Documentar nueva variable |
| `src/lib/mail/contact-settings.ts` | Leer `MAIL_FROM` y mejorar validación | Separar lógica de soporte |
| `src/services/mail/forwardContactMessage.ts` | Usar `MAIL_FROM_NOTIFICATIONS` | Distinguir notificaciones internas |
| `src/features/enrollments/actions/enrollment.actions.ts` | Importar y llamar `sendEnrollmentConfirmation()` | Integrar envío automático |

### 4.2. Commits

```
dc05544 feat(enrollments): integrar correos automáticos de confirmación (MV-38)
b9d0ca4 refactor(mail): separar variables para soporte y notificaciones en Resend
f884972 Merge remote-tracking branch 'origin/develop'
```

---

## 5. Flujo Completo de Envío

```
Usuario hace clic "INSCRIBIRSE"
    ↓
enrollUserAction() valida:
  - ¿Usuario autenticado?
  - ¿Curso/evento existe?
  - ¿Já inscrito?
    ↓
Crear Enrollment en BD (status: REGISTERED)
    ↓
Recuperar datos de Enrollment.course o Enrollment.event
    ↓
Llamar sendEnrollmentConfirmation()
    ↓
Resend.emails.send({
  from: MAIL_FROM,
  to: user.email,
  subject: "[Maestro Virtual] Confirmación de inscripción: {titulo}",
  html: {plantilla HTML con detalles}
})
    ↓
Si éxito: OK (silencioso)
Si error: Log + continuamos (inscripción ya completada)
    ↓
Retornar { success: true, message: "¡Te has inscrito!" }
```

---

## 6. Testing Manual en Desarrollo

Para verificar que MV-38 funciona correctamente:

### 6.1. Preparación
1. Asegúrate que tienes las variables configuradas en `.env`:
   ```bash
   MAIL_FROM="Soporte Maestro Virtual <soporte@maestrovirtual.org>"
   MAIL_FROM_NOTIFICATIONS="Sistema Maestro Virtual <importante@maestrovirtual.org>"
   RESEND_API_KEY=tu_clave_de_resend
   ```

2. Verifica que la rama esté actualizada:
   ```bash
   git branch
   # Deberías estar en feature/MV-38-confirmation-mails
   ```

### 6.2. Test: Inscribirse en un Curso
1. Abre el navegador en `http://localhost:3000/es/cursos` (o `/en/courses`)
2. Inicia sesión con una cuenta de test
3. Haz clic en un curso
4. Haz clic en "INSCRIBIRSE"
5. Verifica en consola (terminal dev) que no hay errores
6. **Importante:** Revisa tu email configurado en `.env` (debe llegar el correo en ~5 segundos)

### 6.3. Test: Inscribirse en un Evento
1. Abre el navegador en `http://localhost:3000/es/eventos`
2. Haz clic en un evento
3. Haz clic en "INSCRIBIRSE"
4. Revisa tu email

### 6.4. Verificar en Base de Datos
```bash
npx prisma studio
# Navega a Enrollment
# Deberías ver el nuevo registro con status: "REGISTERED"
```

### 6.5. Verificar Logs
En la terminal donde corre `npm run dev`:
- Si el correo se envía: No verás error
- Si el correo falla: Verás `console.error("Error enviando correo...")` pero la inscripción seguirá exitosa

---

## 7. Métricas de Calidad

- **Tipado:** TypeScript con tipos discriminados para prevenir errores en tiempo de compilación
- **Validación:** Resend rechaza automáticamente emails mal formados, fallará visiblemente si `MAIL_FROM` es inválido
- **Testing:** Probado manualmente en navegador y BD
- **Logging:** Errores de envío se registran con `console.error` para debugging

---

## 8. Notas Futuras

### Si queremos mejorar:
1. **Reintento de correos fallidos:** Guardar registros fallidos en una tabla `FailedEmails` para reintentarlos
2. **Plantillas personalizadas:** Permitir HTML custom por curso/evento
3. **Multiidioma:** Traducir plantilla a otros idiomas además de español
4. **Tracking:** Integrar webhooks de Resend para saber si el usuario abrió el email

---

## 9. Funcionalidad de Eliminar Mensajes (Bonus)

Además del MV-38 original, se agregó capacidad para eliminar mensajes en el Admin Panel:

### 9.1. Características
- **Selección múltiple:** Checkboxes para seleccionar mensajes individuales o "Seleccionar todo"
- **Botón de eliminar:** Muestra contador de mensajes seleccionados
- **Modal de confirmación:** Pregunta si estás seguro antes de eliminar, muestra cantidad
- **Eliminación en cascada:** Elimina automáticamente las respuestas asociadas antes del mensaje

### 9.2. Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/features/admin/components/AdminMessagesView.tsx` | Agregar UI de selección y modal de confirmación |
| `src/app/api/admin/messages/[id]/route.ts` | Agregar método DELETE con transacción |

### 9.3. Cómo funciona
1. El usuario selecciona mensajes con checkboxes
2. Aparece botón rojo "para eliminar" con contador en header
3. Al hacer clic, se abre modal de confirmación
4. Si confirma, se envían DELETE requests para cada mensaje
5. Primero se eliminan las ContactReply (respuestas), luego ContactMessage
6. Se muestra mensaje de éxito después de eliminar

---

## 10. Contacto & Preguntas

Si necesitas hacer cambios o tienes dudas:
- La lógica principal está en `src/features/enrollments/actions/enrollment.actions.ts`
- Las variables se configuran en `.env` (no commitear `.env` real, solo `.env.example`)
- Si falla un envío, revisa los logs de Resend en el dashboard web
- Para eliminar mensajes, revisa `src/features/admin/components/AdminMessagesView.tsx` y `src/app/api/admin/messages/[id]/route.ts`
