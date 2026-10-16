# Conectar Gmail para enviar y recibir conversaciones

El panel puede usar **maestrovirtualorg@gmail.com** como cuenta institucional.
No necesita un dominio propio ni Resend para responder mediante Gmail. Se
requiere un cliente OAuth de Google Cloud y la autorización de esa cuenta.
El código está preparado; sin esas credenciales no se pueden comprobar envíos
ni contestaciones reales contra Google.

## 1. Preparar Google Cloud

1. Crear o elegir un proyecto en [Google Cloud](https://console.cloud.google.com/).
2. Habilitar **Gmail API** en la biblioteca de APIs del proyecto.
3. Configurar la pantalla de consentimiento de Google Auth Platform. Para probar
   con una cuenta `@gmail.com`, usar audiencia externa en modo de pruebas y
   agregar `maestrovirtualorg@gmail.com` como usuario de prueba.
4. Declarar los permisos usados por el panel:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.compose`
5. Crear un **cliente OAuth de tipo Aplicación web**. Agregar esta URI de
   redirección autorizada, exactamente:

   ```text
   http://localhost:3000/api/admin/mailbox/gmail/callback
   ```

6. Guardar el ID y el secreto del cliente en el `.env` local. No son la
   contraseña del correo y no deben subirse a Git ni compartirse en el chat.

Para Vercel hay que registrar también la URL exacta del callback en ese entorno
y configurar sus variables en Preview/Production. Una URL estable del despliegue
facilita esta configuración; no se aceptan comodines en la URI OAuth. El `.env`
local no se sube ni configura automáticamente esos entornos.

## 2. Variables locales

Conservar las conexiones de base de datos y AUTH_SECRET existentes. Añadir:

```dotenv
MAIL_PROVIDER=gmail
GMAIL_ACCOUNT_EMAIL=maestrovirtualorg@gmail.com
GMAIL_CLIENT_ID=el_id_del_cliente.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=el_secreto_del_cliente
GMAIL_OAUTH_REDIRECT_URI=http://localhost:3000/api/admin/mailbox/gmail/callback
```

Es recomendable definir también `GMAIL_TOKEN_SECRET` con al menos 32 caracteres
para cifrar los tokens. Puede generarse con `openssl rand -base64 32`. Si no se
define, se usa AUTH_SECRET. Los entornos que comparten esta conexión en la base
deben compartir la clave de cifrado y el cliente OAuth correspondiente; también
se pueden separar sus bases. Cambiar la clave exige volver a conectar Gmail.

En modo Gmail no se requieren MAIL_FROM ni RESEND_API_KEY para las respuestas
del panel: el remitente será la cuenta autorizada. Las notificaciones del
formulario a CONTACT_EMAIL conservan su integración opcional con Resend.

Reiniciar el servidor local después de configurar las variables.

## 3. Autorizar la cuenta

1. Entrar al panel con una cuenta STAFF.
2. En Mensajes, usar **Conectar Gmail**.
3. Seleccionar **maestrovirtualorg@gmail.com** y revisar/aceptar los permisos.
4. Volver al panel. Debe indicar la cuenta conectada y mostrar **Sincronizar
   correo**.

Solo se acepta la cuenta configurada. Una cuenta personal distinta es rechazada.
El flujo usa estado ligado a la sesión de staff, PKCE y cookie HttpOnly de diez
minutos. El refresh token se cifra con AES-256-GCM en la base y nunca se envía al
navegador. No se almacena la contraseña ni un access token permanente.

Google concede lectura del buzón y gestión de borradores/envío. El panel guarda
solo mensajes vinculados a sus conversaciones, aunque necesita consultar
metadatos para identificar los hilos. No importa el resto del buzón, no cambia
sus carpetas y no sincroniza los estados leído/no leído con Gmail. Desconectar
revoca el acceso en Google y elimina la conexión local, conservando el historial.

## 4. Prueba completa

1. Enviar un mensaje desde el formulario con un correo personal accesible.
2. Abrirlo en el panel y responder desde la cuenta institucional conectada.
3. Confirmar que llega al correo personal desde maestrovirtualorg@gmail.com.
4. Responder a ese correo usando **Responder**, dentro del mismo hilo.
5. Usar **Sincronizar correo** en el panel. La contestación debe aparecer a la
   derecha, con nombre, fecha y estado Recibido. Las respuestas institucionales
   aparecen a la izquierda con logo y autor.
6. Marcar leído y volver a sincronizar: el mismo mensaje no debe duplicarse ni
   restablecer el estado no leído. Una nueva contestación sí lo marca no leído.
7. Si se responde al mismo hilo desde la app de Gmail con la cuenta institucional,
   ese mensaje también puede importarse a la izquierda. Se identifica como
   **Cuenta institucional (Gmail)**: no es posible saber qué persona utilizó
   la cuenta compartida.

La recepción se consulta al abrir el panel, al recuperar el foco y cada minuto
mientras esté visible. Con el panel cerrado no hay un proceso de sincronización
en segundo plano; Gmail conserva las respuestas y el panel las consulta al volver.
No se implementa un servicio de correo de propósito general ni recepción de
correos nuevos sin vínculo con un hilo iniciado por el panel mediante Gmail.
Los hilos anteriores de Resend no se vinculan automáticamente.

## 5. Estados, reintentos y límites

Se crea un borrador de Gmail y se guarda su ID antes de enviarlo. Los reintentos
usan ese mismo borrador y buscan el Message-ID en Enviados para reconciliar
cortes de red; no crean automáticamente otro correo ante un resultado incierto.
Un bloqueo temporal impide dos envíos simultáneos del mismo intento. Si un
borrador se modifica desde Gmail, el panel comprueba que remitente, destinatario,
asunto y texto coincidan antes de enviarlo.

La sincronización usa el historial incremental y un cursor de página. Si Gmail
expira el historial, se recuperan los hilos conocidos por lotes de cinco y luego
se retoma la consulta incremental. Cada mensaje tiene un identificador único
para evitar duplicados. Un fallo de guardado no adelanta el cursor. Las respuestas
nuevas entrantes desarchivan la conversación, la marcan no leída y actualizan su
fecha de actividad; los hilos en Spam permanecen en Spam.

Se guardan cuerpo de texto y metadatos de las respuestas, no adjuntos. Los cuerpos
HTML se convierten a texto, sin imágenes remotas ni HTML ejecutable. El texto
importado se limita a 100000 caracteres. La conversación muestra 20 registros
por página, ordenados cronológicamente dentro de cada página.

Las cuotas, autorización y disponibilidad de Gmail dependen de Google. En una
app externa en modo Testing, el refresh token de estos permisos puede expirar a
los siete días y exigir nueva autorización. Para producción hay que revisar la
verificación y posibles excepciones aplicables a permisos restringidos; no se
debe considerar el modo Testing una conexión permanente.

Fuentes: [OAuth para aplicaciones web](https://developers.google.com/identity/protocols/oauth2/web-server),
[sincronización de Gmail](https://developers.google.com/workspace/gmail/api/guides/sync),
[envío de mensajes](https://developers.google.com/workspace/gmail/api/guides/sending),
[caducidad de tokens](https://developers.google.com/identity/protocols/oauth2/),
[verificación de permisos restringidos](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification).
