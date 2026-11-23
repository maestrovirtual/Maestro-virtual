# MV-35: Pruebas E2E del panel de administración

**Responsable:** Leo (QA)
**Sprint:** Sprint 3
**Épica:** QA, accesibilidad y performance
**Story Points:** 5

---

## 1. Objetivo

Probar de punta a punta, en un navegador real, el flujo completo del panel de administración: login de staff → crear → editar → eliminar un curso, y lo mismo para un evento. Valida lo construido en MV-31 (interfaz del panel), MV-32 (eventos) y MV-33 (autenticación de staff).

**Criterio de aceptación:** pruebas automatizadas que cubran creación, edición y eliminación exitosas, además de casos de error (por ejemplo, intentar guardar un curso sin título).

---

## 2. Alcance

Incluye:

- Login de staff por `/es/staff/login`.
- Crear, editar y eliminar un **curso** y un **evento**, comprobando cada resultado en la lista.
- Caso de error: guardar un curso o un evento **sin título**.
- Acceso al panel sin sesión: debe mandar a `/es/staff/login`.

No incluye:

- Bandeja de mensajes de contacto (MV-34, con su propio archivo de pruebas).
- Ejecución en CI: las pruebas necesitan base de datos y se saltan en CI.

---

## 3. Decisiones

| Decisión | Por qué |
|----------|---------|
| Reescribir `admin-e2e.spec.ts` | La versión anterior nunca iniciaba sesión: el panel la mandaba al login y la prueba lo daba por válido, y el CRUD estaba con `test.skip`. No comprobaba nada. |
| Usuario staff desde el `.env` | Las credenciales no van en el código. Si faltan, las pruebas se saltan avisando el motivo. |
| Datos creados con título «E2E curso / E2E evento + fecha» | Se distinguen de los datos reales y no chocan entre corridas (el título genera un slug único). |
| Guardar como **borrador** (se desmarca «Publicado») | El curso o evento de prueba no aparece en el sitio público mientras existe. |
| Eliminar dentro del diálogo de confirmación | Como la base de datos es compartida, el test exige el diálogo antes de confirmar, para no borrar otra tarjeta por error. |

---

## 4. Cómo funciona

Cada prueba de CRUD sigue estos pasos:

1. Inicia sesión como staff.
2. Abre la lista (`/es/admin/cursos` o `/es/admin/eventos`) y el modal con «Crear Nuevo Curso / Evento».
3. Llena título, descripción y, en eventos, la fecha (30 días adelante), y guarda.
4. Comprueba que el título aparece en la lista.
5. Edita el título, guarda y comprueba el cambio.
6. Elimina el registro, confirma en el diálogo y comprueba que desaparece.

La prueba de error abre el modal, intenta guardar sin título y comprueba que el modal sigue abierto, que el título queda marcado como faltante y que no se creó nada.

Detalles técnicos:

- Los modales son `role="dialog"`.
- Las etiquetas del formulario no están enlazadas a sus campos, por lo que el título se localiza como el primer campo de texto del modal.
- La tarjeta de un registro se encuentra buscando el título y subiendo hasta el contenedor que tiene el botón «Editar».

---

## 5. Qué cubre cada prueba

| Prueba | Verifica |
|--------|----------|
| Crear, editar y eliminar un curso | Flujo completo con login de staff |
| Crear, editar y eliminar un evento | Flujo completo con login de staff |
| Error al guardar un curso sin título | El modal no guarda y no se crea nada |
| Error al guardar un evento sin título | El modal no guarda y no se crea nada |
| Entrar al panel sin sesión | Redirección a `/es/staff/login` con el título «Acceso para staff» |

---

## 6. Requisitos y cómo ejecutar

Requisitos:

1. `.env` en la raíz con `DATABASE_URL`, `DIRECT_URL` y `AUTH_SECRET`.
2. Un usuario con rol `STAFF` (se crea con `npm run staff:create`).
3. Sus credenciales en el `.env`:
   ```
   E2E_STAFF_EMAIL=correo_del_staff
   E2E_STAFF_PASSWORD=su_contraseña
   ```

Ejecución:

```bash
npx playwright test admin-e2e --headed   # ver el proceso
npx playwright test admin-e2e --ui       # modo interfaz de Playwright
```

---

## 7. Limitaciones

- Crea y borra datos en la base compartida. Si una prueba falla a la mitad, puede quedar un registro «E2E …» como borrador en el panel; se elimina a mano.
- Solo se prueba en español (`/es`).
- No corre en CI (necesita base de datos y un usuario staff).

---

## 8. Hallazgo de accesibilidad

En `CourseModal`, `CourseForm` y `EventModal`, las etiquetas de los campos no están enlazadas a su `<input>` (falta `htmlFor`/`id`). Solo la del checkbox «Publicado» de eventos lo está. Un lector de pantalla no anuncia el nombre de esos campos, y hacer clic en la etiqueta no enfoca el campo. El arreglo es el mismo para los tres componentes.

---

## 9. Pruebas

| Tipo | Archivo | Qué cubre |
|------|---------|-----------|
| E2E | `e2e-tests/admin-e2e.spec.ts` | Login de staff, CRUD de cursos y eventos, errores sin título y acceso sin sesión |

**Última ejecución local:** 5 de 5 pruebas pasaron.

---

## Checklist de calidad

- [x] Pruebas ejecutadas localmente: 5 de 5 en verde.
- [x] Sin credenciales escritas en el código.
