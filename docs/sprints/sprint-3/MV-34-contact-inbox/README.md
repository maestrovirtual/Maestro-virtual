> Gmail institucional: la integración actual permite recibir contestaciones de
> hilos vinculados y mostrar una conversación. Ver [GMAIL_SETUP.md](GMAIL_SETUP.md)
> para habilitar OAuth. Las limitaciones de recepción mencionadas abajo se
> refieren al proveedor Resend sin esa conexión.

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

## Responder desde el panel

Al abrir un mensaje, “Responder desde el panel” despliega un editor de texto
plano con asunto, destinatario, remitente institucional, vista previa y contador
de caracteres. “Abrir en mi app de correo” conserva la alternativa externa y
prepara destinatario/asunto; esa app decide la cuenta de salida y sus envíos no
se registran en el panel. Los enlaces codifican los valores del destinatario y
asunto para evitar inyección de parámetros en `mailto:`.

### Configuración del correo institucional

```dotenv
RESEND_API_KEY=clave_del_entorno
MAIL_FROM="Maestro Virtual <contacto@tu-dominio-verificado.org>"
MAIL_REPLY_TO=buzon-institucional@tu-dominio.org
CONTACT_EMAIL=buzon-institucional@tu-dominio.org
```

Los valores son ilustrativos: el dominio de MAIL_FROM debe estar verificado en
Resend y el buzón de respuesta debe poder recibir correo. MAIL_REPLY_TO es
opcional: por defecto se usa CONTACT_EMAIL y después la dirección de MAIL_FROM.
CONTACT_EMAIL continúa siendo el destinatario de las notificaciones del
formulario. Las notificaciones usan MAIL_FROM cuando existe; las respuestas del
panel requieren MAIL_FROM institucional y no aceptan el remitente de prueba
`@resend.dev`. El estado de configuración no verifica el dominio mediante API;
Resend realiza esa validación al enviar. Configurar las variables también en
Preview/Production del despliegue correspondiente y reiniciar/republicar.

Si falta la clave o el remitente, la pantalla explica qué configurar y permite
redactar/vista previa, pero no enviar. Nunca expone la clave al navegador. El
editor conserva el texto en memoria ante un error; no guarda borradores al
recargar o cerrar el mensaje. Las contestaciones futuras del destinatario llegan
al buzón indicado en Reply-To: todavía no se importan al historial del panel.

### Historial y estados

- `GET /api/admin/messages/{id}/replies?page=1` carga 20 respuestas por página,
  más recientes primero, y la configuración pública del remitente. Protegido
  por STAFF, sin caché compartida.
- `POST /api/admin/messages/{id}/replies` recibe `requestId` UUID, `subject`
  (1–200 caracteres, sin saltos de línea) y `body` (1–10000 caracteres).
  El remitente y destinatario se obtienen del servidor; los valores enviados
  por el navegador no pueden reemplazarlos. Se valida origen y tipo JSON.
- Guarda autor (ID y nombre), texto, asunto, destinatario, remitente, Reply-To,
  fechas, resultado e identificador de Resend en ContactReply. No modifica el
  mensaje original ni su estado leído/no leído.
- SENT se muestra como “Enviado” y habilita el indicador “Respondido” de la
  bandeja. Significa aceptación por Resend, no entrega ni lectura del correo.
- FAILED se muestra como “No enviado” ante un rechazo confirmado. PENDING se
  muestra como “Por confirmar” si hay un envío en proceso o un resultado incierto.
- Antes de responder a spam debe usarse “No es spam”.

La migración `20261016020000_contact_replies` crea la tabla, estados, relación al
mensaje y un índice único parcial que permite solo un intento PENDING por
mensaje. Se aplicó a la base configurada en este entorno, sin borrar contactos.
Los otros entornos requieren `npx prisma migrate deploy` y regenerar Prisma.

### Reintentos y límites

Se persiste el intento antes de llamar a Resend y se reutiliza la misma clave
`contact-reply/{id}` y el mismo contenido en los reintentos. Resend conserva
claves durante 24 horas; el panel limita reintentos a 23 horas desde la creación.
Una solicitud ya SENT devuelve su resultado sin reenviar. El índice parcial
impide iniciar otra respuesta mientras exista una pendiente de confirmación.
Solo el autor original puede reintentar un registro desde el historial.

Un envío incierto o demasiado antiguo requiere revisión en Resend antes de
intentar una respuesta nueva; no hay una acción automática para desbloquearlo
asumiendo que falló. No se implementan adjuntos, CC/BCC, borradores persistentes,
webhooks de entrega ni recepción del hilo de correo.

Referencia del proveedor: https://resend.com/docs/dashboard/emails/idempotency-keys

### Validación de esta ampliación

199 pruebas Jest, lint, TypeScript, build y 8 pruebas Playwright de acceso.
Los escenarios de envío y rechazo de Resend se verificaron con el servicio
simulado: permisos, destinatario/remitente del servidor, entradas inválidas,
configuración faltante, historial paginado, vista previa, texto conservado tras
fallos, ID reutilizado, respuestas duplicadas, ventana de reintento y caídas de
red/base de datos. Se verificó en el navegador el editor real y su bloqueo por
configuración faltante. No se enviaron respuestas reales: faltan RESEND_API_KEY
y MAIL_FROM en la configuración local.


## Conversaciones y Gmail

El mensaje original y las contestaciones del contacto aparecen a la derecha;
los envíos institucionales a la izquierda, con logo, nombre/autor, fecha y estado.
Se conserva el editor, vista previa, historial paginado e intentos pendientes.
Los mensajes de una conversación ya respondida se abren con su historial visible.

`MAIL_PROVIDER=gmail` habilita la conexión institucional en el panel. La nueva
integración OAuth se configura según [GMAIL_SETUP.md](GMAIL_SETUP.md). No se ha
realizado una autorización real de Google en este entorno: faltan el cliente
OAuth y su secreto. La pantalla lo indica y deshabilita Conectar/Enviar hasta
que estén configurados.

La migración `20261016030000_gmail_conversation` añade dirección/proveedor e IDs
de hilo/borrador, una conexión cifrada de buzón y última actividad por contacto.
Se aplicó a la base local configurada, conservando los mensajes. Otros entornos
requieren aplicar las migraciones y configurar sus variables antes de desplegar.
Las conversaciones se ordenan ahora por última actividad; se conserva la fecha
del mensaje original para mostrarla correctamente dentro del hilo.

Las pruebas de Gmail usan respuestas simuladas: OAuth/PKCE y vinculación de staff,
cuenta correcta/permisos, cifrado, autorización, envío por borrador estable,
reconciliación, recepción y deduplicación, remitente esperado, recuperación del
cursor, HTML a texto, conversación y estados de conexión. La validación real
con correo de ida/vuelta queda pendiente de la configuración de Google.


Validación de conversación/Gmail: 236 pruebas Jest, lint, TypeScript y build.
Las pruebas de navegador incluyen ahora la protección de conexión, callback y
sincronización Gmail (9 pruebas Playwright de acceso en total). Los servicios
Google se simularon: la autorización y el recorrido real siguen pendientes de
las credenciales OAuth. No se conectó ni se envió correo desde Gmail.
