# MV-34: Bandeja de mensajes de contacto

**Responsable:** Brandon · **Story Points:** 3 · **Épica:** Formulario de contacto funcional

El staff puede abrir `/{locale}/admin/mensajes` desde el panel y revisar los
mensajes recibidos por el formulario, ordenados del más reciente al más antiguo.
Cada mensaje muestra remitente, correo, asunto, fecha (zona America/Monterrey) y
estado leído/no leído. El contenido se abre con “Ver mensaje”; el estado se cambia
explícitamente y se conserva en la base de datos. “Responder por correo” abre el
cliente de correo del staff. Hay paginación de 20 mensajes, actualización manual,
estado vacío, carga y reintento de errores.

## Persistencia y acceso

- `POST /api/contact` conserva las validaciones, honeypot y límite de envíos.
  Guarda el mensaje antes de notificar por correo. Si la notificación falla,
  responde éxito con `notificationSent: false`: el mensaje sigue en la bandeja.
  Si falla la base de datos, no envía correo ni confirma recepción.
- `GET /api/admin/messages?page=1` devuelve `{ messages, total, page, pageSize }`.
  Ordena por `date DESC, id DESC` y evita caché compartida.
- `PATCH /api/admin/messages/{id}` recibe `{ isRead: boolean }`; devuelve 404
  cuando el mensaje no existe y 400 para cuerpos inválidos.
- Tanto la página como las APIs verifican sesión y rol STAFF. Las APIs devuelven
  401/403 sin consultar mensajes a usuarios sin permiso.

## Dependencia MV-33

Esta rama se creó desde `develop` actualizado e integra
`feature/MV-33-autenticacion-staff`, que aún no estaba en `develop`, para utilizar
su autenticación. Su configuración `AUTH_SECRET` y alta de staff se describen en
[MV-33](../MV-33-staff-auth/README.md). Al revisar el PR, considerar esta dependencia
(o integrar MV-33 primero).

## Migración requerida

Antes de habilitar el formulario y la bandeja en el entorno destino:

```sh
npx prisma migrate deploy
npx prisma generate
```

La migración `20261014000000_contact_message_subject` agrega `subject` sin borrar
mensajes existentes. Los mensajes previos tienen asunto vacío y se muestran como
“Sin asunto”. Los correos enviados antes de esta implementación que nunca fueron
guardados no se recuperan automáticamente.

## Validación

Las pruebas cubren permisos 401/403, orden y paginación, validación de entradas,
actualización de ambos estados, mensajes inexistentes, errores de base de datos,
persistencia previa al correo y fallos de notificación. Las pruebas de interfaz
cubren apertura del mensaje, confirmación del estado por el servidor, fallos de
actualización, bandeja vacía y reintento de carga.

Resend se inicializa al enviar correo, no al importar módulos: la ausencia de
`RESEND_API_KEY` no impide compilar ni guardar mensajes; se registra como fallo
de notificación. El envío real requiere `RESEND_API_KEY` y `CONTACT_EMAIL`.

Validación automatizada: 121 pruebas Jest, ESLint, TypeScript y 7 pruebas
Playwright de acceso a staff y a la bandeja (más la compilación de producción
validada en la implementación inicial). El usuario aplicó la migración en su
base; se verificó un mensaje de diagnóstico real sin Resend y su lectura desde
el panel. No se enviaron correos a servicios reales.

El honeypot se oculta con el atributo HTML `hidden` para evitar que el navegador
lo autocomplete como un campo de sitio web. El formulario no muestra una
confirmación si la respuesta antispam tiene `id: "skipped"`: requiere el ID de un
mensaje guardado. Las pruebas cubren este caso y la recepción sin notificación.
