# MV-45: Regresión completa E2E

**Responsable:** Leo (QA)
**Sprint:** Sprint 5
**Épica:** QA, accesibilidad y performance
**Story Points:** 3

---

## 1. Objetivo

Correr juntas todas las pruebas E2E acumuladas de los sprints anteriores, para confirmar que nada se rompió con los cambios más recientes.

**Criterio de aceptación:** todos los flujos críticos (contacto, cursos/eventos, panel admin, inscripción) pasan sin errores.

---

## 2. Alcance

Esta tarea no agrega código nuevo: ejecuta, revisa y documenta el resultado de la suite completa.

| Flujo | Archivo de pruebas |
|-------|--------------------|
| Contacto: bandeja protegida (MV-34) | `e2e-tests/contact-inbox.spec.ts` |
| Contacto: formulario público | `e2e-tests/integration.spec.ts` |
| Cursos: lista y detalle desde la API/BD | `e2e-tests/integration.spec.ts` |
| Cursos y eventos: crear, editar y eliminar desde el panel | `e2e-tests/admin-e2e.spec.ts` (MV-35) |
| Autenticación de staff | `e2e-tests/staff-auth.spec.ts` (MV-33) |
| Inscripción a un curso (y a un evento, ver limitaciones) | `e2e-tests/enrollment-flow.spec.ts` (MV-41) |

---

## 3. Cómo se ejecutó

1. Actualizar la rama con lo último de `develop`:
   ```bash
   git pull
   npx prisma generate
   ```
2. Tener el `.env` completo (ver requisitos).
3. Correr toda la suite y abrir el reporte:
   ```bash
   npx playwright test --reporter=list
   npx playwright show-report
   ```
4. Para cada fallo, clasificarlo y repetir hasta que todo pase o queden documentados los pendientes.

### Requisitos

| Variable | Uso |
|----------|-----|
| `DATABASE_URL`, `DIRECT_URL` | Base de datos (las pruebas usan la base compartida del equipo) |
| `AUTH_SECRET` | Firma de las sesiones |
| `E2E_STAFF_EMAIL`, `E2E_STAFF_PASSWORD` | Usuario staff para las pruebas del panel (MV-35) |

Notas:

- Las pruebas de **inscripción** y del **panel admin** necesitan base de datos y se saltan en CI; esta regresión se ejecuta de forma local.
- Si aparecen fallos intermitentes por la conexión a la base de datos o por los límites de intentos de login y registro (`429`), reiniciar `npm run dev` y repetir con `npx playwright test --workers=1`.
- La prueba de inscripción usa una cuenta fija (`delivered@resend.dev`, dirección de prueba de Resend) y borra sus inscripciones antes de correr.

---

## 4. Resultados

**Corrida del 1 de noviembre de 2026** (rama `develop`), con `npx playwright test --reporter=list`: 19 pruebas, 6 en paralelo, 1.4 minutos.

**Resultado: 18 pasaron, 1 se saltó, 0 fallaron.**

| Archivo | Pruebas | Pasaron | Fallaron | Saltadas |
|---------|---------|---------|----------|----------|
| `contact-inbox.spec.ts` | 5 | 5 | 0 | 0 |
| `integration.spec.ts` | 3 | 3 | 0 | 0 |
| `admin-e2e.spec.ts` | 5 | 5 | 0 | 0 |
| `staff-auth.spec.ts` | 4 | 4 | 0 | 0 |
| `enrollment-flow.spec.ts` | 2 | 1 | 0 | 1 |
| **Total** | **19** | **18** | **0** | **1** |

**Prueba saltada:** «Debe inscribir a la cuenta en un evento». Se salta sola porque `/es/events` no tiene eventos publicados («Aún no hay eventos programados»).

### Hallazgos

Ninguna prueba falló, pero la salida del servidor y del navegador mostró lo siguiente. Son avisos del servidor de desarrollo.

| # | Hallazgo | Tipo | Estado |
|---|----------|------|--------|
| 1 | No hay eventos publicados, por lo que la inscripción a un evento no se prueba y la agenda pública no tiene cobertura E2E. | Dato faltante | Pendiente: publicar un evento de prueba y repetir |
| 2 | Las imágenes por defecto no existen: `/images/courses/default.jpg` y `/images/events/default.jpg` (error «The requested resource isn't a valid image»). Un curso o evento creado sin imagen se vería roto. Apareció porque las pruebas del panel crean registros sin imagen. | Bug real (menor) | Por reportar a quien hizo MV-31 / MV-32 |
| 3 | Error en la consola del navegador: «Target ref is defined but not hydrated» (de `useScroll` de la librería de animaciones). Aparece en varias páginas y no hace fallar las pruebas. | Bug real (menor) | Por reportar |
| 4 | Avisos de Next Image: imágenes con `fill` sin la propiedad `sizes` (las de los cursos) y el logo con ancho o alto modificado sin ajustar el otro. Afecta al rendimiento. | Mejora (performance) | Por reportar |

---

## 5. Limitaciones

- La regresión es local: no hay ejecución automática en CI, porque varias pruebas necesitan base de datos.
- La inscripción a un evento (`enrollment-flow.spec.ts`) se salta porque no hay eventos publicados; mientras no exista uno, la agenda pública de eventos no tiene cobertura E2E.
- Se prueba solo la versión en español (`/es`).
- Las pruebas crean datos en la base compartida (cuenta de pruebas, cursos y eventos «E2E …» que se eliminan al terminar). Conviene pedir una base de datos de pruebas separada.

---


## Checklist de calidad

- [x] Rama actualizada con `develop` antes de correr.
- [x] Suite completa ejecutada (`npx playwright test`): 18 pasaron, 1 saltada, 0 fallaron.
- [x] Todos los flujos críticos pasan; el único pendiente (inscripción a evento) quedó documentado.
- [x] Tabla de resultados y hallazgos completada.
