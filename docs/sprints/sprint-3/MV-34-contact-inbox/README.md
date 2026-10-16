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

Validación automatizada: 158 pruebas Jest, ESLint, TypeScript y 7 pruebas
Playwright de acceso a staff y a la bandeja (más la compilación de producción
validada en la implementación inicial). El usuario aplicó la migración en su
base; se verificó un mensaje de diagnóstico real sin Resend y su lectura desde
el panel. No se enviaron correos a servicios reales.

El honeypot se oculta con el atributo HTML `hidden` para evitar que el navegador
lo autocomplete como un campo de sitio web. El formulario no muestra una
confirmación si la respuesta antispam tiene `id: "skipped"`: requiere el ID de un
mensaje guardado. Las pruebas cubren este caso y la recepción sin notificación.


## Archivado reversible

La pestaña Bandeja de entrada muestra únicamente mensajes con `isArchived=false`;
Archivados muestra los de `isArchived=true`. Ambas vistas ordenan por fecha y
cargan 20 registros por página con conteo filtrado en el servidor. Archivar o
“Devolver a la bandeja” cambia únicamente ese indicador: conserva contenido,
fecha y estado leído/no leído. No se implementa eliminación ni papelera.

`GET /api/admin/messages` admite `view=inbox` (predeterminado) o `view=archived`.
`PATCH /api/admin/messages/{id}` acepta `isRead` y/o `isArchived` booleanos;
rechaza campos desconocidos. Mantiene la verificación STAFF para ambas acciones.
Si se mueve el último mensaje de una página posterior, la vista vuelve a la
página anterior para evitar dejar una página vacía.

La migración `20261016000000_contact_message_archive` añade `isArchived` con valor
predeterminado falso y un índice por archivado, fecha e ID. Se aplicó a la base
configurada en el entorno local sin eliminar registros. En otros entornos debe
aplicarse con `npx prisma migrate deploy` antes de desplegar este código.

Las pruebas incluyen archivado/restauración, separación de carpetas y sus
conteos, estados inválidos, permisos, fallos de guardado y el último mensaje de
una página.


## Spam reversible

La carpeta Spam muestra mensajes marcados manualmente por el staff. “Marcar como
spam” los retira de Bandeja de entrada o Archivados; “No es spam” los devuelve a
la bandeja. Se conserva el estado de lectura, la fecha y todo el contenido.
No hay eliminación automática. La clasificación de mensajes nuevos se detalla abajo. El
honeypot del formulario conserva su comportamiento independiente de rechazo.

`GET /api/admin/messages?view=spam` devuelve solo esa carpeta, con paginación y
conteo en el servidor. Las otras dos vistas excluyen spam. El PATCH admite
`isSpam: boolean`; al marcar spam se desactiva archivado y al archivar se
desactiva spam. Una petición que intente activar ambos estados es rechazada.

La migración `20261016010000_contact_message_spam` agrega `isSpam=false`, actualiza
el índice de carpetas y evita con una restricción que un mensaje esté archivado
y en spam simultáneamente. Se aplicó a la base configurada del entorno local;
los demás entornos requieren `npx prisma migrate deploy` antes de usar el código.
Las pruebas cubren aislamiento de carpetas, marcado y restauración, permisos,
estados incompatibles y fallos del servidor.


## Clasificación automática y no leídos por carpeta

Los mensajes nuevos pasan por `src/lib/contact/spam.ts` antes de guardarse. Un
mensaje se clasifica como sospechoso si concentra al menos cuatro enlaces de
tres dominios y estos ocupan 30% del texto; si tiene al menos seis enlaces que
ocupan 50%; o si combina un enlace con una promesa de premio/ganancias de las
reglas y una llamada a hacer clic/reclamar. Se consideran asunto y contenido.

Es un filtro local por reglas, no un modelo entrenado ni un servicio de
reputación. Puede tener falsos positivos o dejar pasar spam: el staff conserva
“No es spam”. No aprende de correcciones, no bloquea al remitente ni reclasifica
mensajes existentes. El contenido sospechoso se guarda sin notificación por
correo y aparece en Spam sin leer; no se elimina ni se expone el resultado del
filtro al visitante. La validación del formulario, honeypot y rate limit siguen
activos antes del guardado.

El GET de mensajes incluye `unreadCounts: { inbox, archived, spam }`, calculado
en el servidor sobre todos los registros de cada carpeta, sin limitarlo a la
página consultada. Las pestañas muestran un círculo rojo cuando hay no leídos;
al llegar a cero desaparece. Leer/no leer modifica el contador local tras la
confirmación del servidor; mover mensajes vuelve a consultar todas las cuentas.

La interfaz consulta novedades cada 30 segundos mientras está visible y vuelve
a consultar al recuperar el foco. No es una actualización instantánea por
WebSocket. Durante una operación de lectura/movimiento se pausa ese refresco.
No se requiere otra migración ni claves adicionales para estas dos mejoras.
Se verificó un mensaje sintético que entró directamente a Spam con Resend sin
configurar, además de pruebas de reglas, contadores por carpeta y actualización
al recuperar el foco de la ventana.
