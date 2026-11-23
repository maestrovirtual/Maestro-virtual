# MV-43: Pruebas de carga en la API

**Responsable:** Eduardo Martinez Soto (Equipo de TI - Maestro Virtual A.C.)
**Fecha de ejecución:** 23 de noviembre de 2026
**Sprint:** Sprint 5
**Épica:** QA, accesibilidad y performance
**Story Points:** 2

---

## 1. Objetivo

Simular muchas solicitudes simultáneas a los endpoints más usados (cursos, eventos e inscripción) para saber si el sistema se cae o se vuelve muy lento bajo carga.

**Criterio de aceptación:** reporte de cuántas solicitudes simultáneas soporta el sistema antes de degradarse.

**Respuesta corta:** el servidor **no se cae** ni con 500 solicitudes simultáneas (0 errores), pero **se degrada a partir de 100** en cursos y de 200 en eventos (p95 mayor a 1 s). Hasta 50 simultáneas responde en menos de 0.6 s. El límite no está en Next.js: lo marcan el pool de 10 conexiones a la base de datos y el tope de 15 clientes del pooler de Supabase (ver [sección 6](#6-por-qué-se-degrada)).

---

## 2. Alcance

Incluye:

| Endpoint | Por qué |
|----------|---------|
| `GET /api/courses` | Lista de cursos (página de cursos y panel admin) |
| `GET /api/events` | Agenda de eventos |
| `GET /api/courses/[slug]` | Detalle de un curso |
| Página `/es/courses/[slug]` | Página desde donde se lanza la inscripción (render del servidor + BD) |

No incluye:

- **La inscripción en sí.** Es una Server Action (`enrollment.actions.ts`) que escribe en la base de datos compartida del equipo. Saturarla llenaría la BD de inscripciones falsas y mandaría correos de confirmación, así que se mide la página de detalle del curso, que es la parte de lectura del flujo.
- Endpoints de escritura (`POST`/`PUT`/`DELETE`) y de cuenta (login, registro): tienen límite por IP (`429`) a propósito.
- Vercel: el despliegue lo administra Brandon y una prueba de carga ahí afecta al sitio real. La prueba se hizo contra el build de producción en local.

---

## 3. Decisiones

| Decisión | Por qué |
|----------|---------|
| [autocannon](https://github.com/mcollina/autocannon) como devDependency | Herramienta estándar de Node para carga HTTP. Se instala con `npm install`, sin binarios externos como k6. |
| Script `scripts/load-test.mjs` + `npm run test:load` | Cualquiera del equipo puede repetir la prueba con un solo comando y obtener las tablas en Markdown. |
| Niveles de 10 → 25 → 50 → 100 → 200 simultáneas, 10 s cada uno | Subir de a poco muestra el punto exacto donde empieza a degradarse. |
| Contra `npm run build && npm start`, no `npm run dev` | En modo dev Next.js compila al vuelo y los tiempos no se parecen a producción. |
| Solo `GET` | No se crean datos en la base compartida. |
| «Degradado» = más de 1% de errores o p95 mayor a 1 s | Arriba de un segundo de espera, la página ya se siente lenta para el usuario. |
| p95 calculado por el script | autocannon reporta p50, p90, p97.5 y p99, pero no p95. El script guarda el tiempo de cada respuesta y calcula los percentiles. |

---

## 4. Cómo ejecutarlo

```bash
npm run build && npm start      # terminal 1: build de producción
npm run test:load               # terminal 2: unos 4 minutos
```

Variables opcionales:

| Variable | Default | Uso |
|----------|---------|-----|
| `LOAD_BASE_URL` | `http://localhost:3000` | Servidor a probar |
| `LOAD_LEVELS` | `10,25,50,100,200` | Niveles de concurrencia |
| `LOAD_DURATION` | `10` | Segundos por nivel |

Ejemplo: `LOAD_LEVELS=300,500 npm run test:load`.

> Si `npm run build` falla con un error de tipos de Prisma (por ejemplo `sponsorsImageUrl`) después de un `git pull`, corre antes `npx prisma generate`.

---

## 5. Resultados

**Entorno:** Mac con Apple M3 (8 GB), Node 25.4, Next.js 16.2.10 en modo producción. Base de datos Supabase (`us-east-1`) por el pooler, con ~58 ms de ida y vuelta desde la máquina de prueba. Pool de Prisma con `max: 10` (valor actual de `src/lib/prisma/client.ts`).

Los niveles 10–200 salen de la corrida completa y los de 300 y 500 de una segunda corrida con `LOAD_LEVELS=300,500`. Latencias en milisegundos.

### `GET /api/courses`

| Simultáneas | Solicitudes | req/s | p50 | p95 | p99 | Errores |
|---:|---:|---:|---:|---:|---:|---:|
| 10 | 884 | 88 | 109 | 119 | 347 | 0 |
| 25 | 934 | 93 | 264 | 274 | 286 | 0 |
| 50 | 945 | 95 | 527 | 538 | 543 | 0 |
| **100** | 900 | 90 | 1056 | **1120** | 1135 | 0 |
| 200 | 876 | 88 | 2104 | 2174 | 2184 | 0 |
| 300 | 900 | 90 | 3132 | 3226 | 3345 | 0 |
| 500 | 894 | 89 | 5070 | 5264 | 5323 | 0 |

### `GET /api/events`

| Simultáneas | Solicitudes | req/s | p50 | p95 | p99 | Errores |
|---:|---:|---:|---:|---:|---:|---:|
| 10 | 1819 | 182 | 54 | 60 | 64 | 0 |
| 25 | 1861 | 186 | 132 | 162 | 172 | 0 |
| 50 | 1881 | 188 | 264 | 278 | 284 | 0 |
| 100 | 1858 | 186 | 529 | 602 | 667 | 0 |
| **200** | 1904 | 190 | 1044 | **1063** | 1072 | 0 |
| 300 | 1611 | 161 | 1563 | 2754 | 3071 | 0 |
| 500 | 1930 | 193 | 2559 | 2617 | 2640 | 0 |

### `GET /api/courses/[slug]`

| Simultáneas | Solicitudes | req/s | p50 | p95 | p99 | Errores |
|---:|---:|---:|---:|---:|---:|---:|
| 10 | 938 | 94 | 105 | 113 | 126 | 0 |
| 25 | 948 | 95 | 261 | 279 | 291 | 0 |
| 50 | 950 | 95 | 522 | 546 | 554 | 0 |
| **100** | 914 | 91 | 1034 | **1067** | 1075 | 0 |
| 200 | 920 | 92 | 2062 | 2106 | 2115 | 0 |
| 300 | 900 | 90 | 3067 | 3125 | 3134 | 0 |
| 500 | 925 | 93 | 5077 | 5159 | 5204 | 0 |

### Página `/es/courses/[slug]`

| Simultáneas | Solicitudes | req/s | p50 | p95 | p99 | Errores |
|---:|---:|---:|---:|---:|---:|---:|
| 10 | 881 | 88 | 110 | 122 | 269 | 0 |
| 25 | 924 | 92 | 264 | 292 | 342 | 0 |
| 50 | 921 | 92 | 527 | 546 | 642 | 0 |
| **100** | 903 | 90 | 1073 | **1110** | 1272 | 0 |
| 200 | 841 | 84 | 2115 | 2323 | 2502 | 0 |
| 300 | 647 | 65 | 3180 | 4838 | 4975 | 0 |
| 500 | 791 | 79 | 5231 | 6330 | 6586 | 0 |

### Resumen

| Endpoint | Rápido (p95 < 300 ms) | Aceptable (p95 < 1 s) | Se degrada desde | Se cae |
|----------|---:|---:|---:|---|
| `GET /api/courses` | hasta 25 | hasta 50 | **100** | No (0 errores con 500) |
| `GET /api/events` | hasta 50 | hasta 100 | **200** | No (0 errores con 500) |
| `GET /api/courses/[slug]` | hasta 25 | hasta 50 | **100** | No (0 errores con 500) |
| Página `/es/courses/[slug]` | hasta 25 | hasta 50 | **100** | No (0 errores con 500) |

**Capacidad máxima de una instancia del servidor:** ~90 req/s en cursos y ~186 req/s en eventos, sin importar cuántos usuarios lleguen a la vez.

---

## 6. Por qué se degrada

Las solicitudes por segundo **no suben** al pasar de 10 a 500 simultáneas. Desde 10 conexiones el servidor ya trabaja a su máximo, y lo que crece es la fila de espera: la latencia es casi exactamente `simultáneas ÷ req/s` (por ejemplo, 100 ÷ 93 ≈ 1.07 s).

Ese máximo lo marca el pool de conexiones a la base de datos (`max: 10` en `src/lib/prisma/client.ts`):

- `/api/courses` y `/api/courses/[slug]` hacen 2 consultas (el curso y sus `testimonials`), unos 105 ms en total → 10 conexiones ÷ 0.105 s ≈ **95 req/s**, igual que lo medido.
- `/api/events` hace 1 consulta, unos 54 ms → 10 ÷ 0.054 ≈ **185 req/s**, igual que lo medido.

### Experimento: subir el pool a 20

Para confirmarlo se cambió temporalmente `max: 10` a `max: 20`, se reconstruyó y se midió con 50 y 100 simultáneas. **Ese cambio no está en este PR**: se regresó a 10 al terminar.

| Endpoint (50 simultáneas) | req/s con `max: 10` | req/s con `max: 20` | Errores con `max: 20` |
|----------|---:|---:|---:|
| `GET /api/courses` | 95 | 155 | **15.1%** |
| `GET /api/events` | 188 | 303 | **7.6%** |
| `GET /api/courses/[slug]` | 95 | 158 | **14.8%** |
| Página `/es/courses/[slug]` | 92 | 155 | 0% |

Las req/s suben ~65%, lo que confirma que el pool es el cuello de botella. Pero aparecen errores `500`, porque el servidor registró:

```
(EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15
```

**El pooler de Supabase acepta como máximo 15 clientes en total.** Por eso `max: 10` es el valor seguro y **no hay que subirlo**.

---

## 7. Hallazgos y recomendaciones

| # | Hallazgo | Impacto | Recomendación |
|---|----------|---------|---------------|
| 1 | El tope de 15 clientes del pooler de Supabase lo **comparten todos**: producción en Vercel, previews y el `npm run dev` de cada integrante. | **Alto en producción.** En Vercel cada instancia serverless crea su propio pool de hasta 10. Con dos instancias activas a la vez (10 + 10 > 15), ya aparecería el error `EMAXCONNSESSION` que se vio en el experimento. | Revisar con Brandon: bajar `max` del pool en producción (por ejemplo 2–3 por instancia), confirmar que `DATABASE_URL` usa el modo *transaction* del pooler o subir el `pool_size` en Supabase. |
| 2 | Cursos y eventos cambian poco, pero cada visita consulta la base de datos. | Medio. Es lo que limita a ~90 req/s. | Cachear las lecturas públicas (`revalidate` de Next.js o `unstable_cache`) e invalidar al crear o editar desde el panel. Así la BD deja de estar en el camino de cada visita. |
| 3 | `GET /api/courses` siempre incluye los `testimonials` de todos los cursos. | Bajo. Duplica el tiempo de base de datos frente a eventos (~105 ms contra ~54 ms). | Revisar si la lista necesita los testimonios; si solo los usa el detalle, quitarlos del `include` de la lista. |
| 4 | El servidor registró 6 veces `TypeError: controller[kState].transformAlgorithm is not a function`. | Ninguno visible: no hubo respuestas con error. Al parecer ocurre cuando autocannon corta conexiones abiertas al terminar cada nivel. | Solo informativo. |

Estas recomendaciones quedan fuera del alcance de MV-43: tocan la configuración de producción y código de otras tareas, así que se proponen por separado.

---

## 8. Limitaciones

- **Es una sola instancia local**, no Vercel. En producción la capacidad depende de cuántas instancias levante Vercel, y el tope de 15 conexiones de Supabase pesa todavía más (hallazgo 1).
- La latencia hacia la base de datos depende de la red de la máquina de prueba. Un servidor en la misma región que Supabase tendría consultas más rápidas y más req/s.
- Se usa la base de datos compartida del equipo. Durante la prueba el servidor ocupa hasta 10 de las 15 conexiones disponibles, así que conviene avisar al equipo antes de correrla, y **no correrla con `max` mayor a 10**.
- Solo se prueban lecturas y la versión en español (`/es`).

---

## 9. Archivos

| Archivo | Autor(es) previo(s) | Cambio |
|---------|---------------------|--------|
| `scripts/load-test.mjs` | — (nuevo) | Script de carga por niveles con autocannon |
| `package.json` | Eduardo, Brandon, Leo, TONPROHD485 | Solo se agregan `autocannon` en devDependencies y el script `test:load` |
| `package-lock.json` | Eduardo, Brandon, Leo, TONPROHD485 | Generado por `npm install -D autocannon` (solo altas, sin cambios a otros paquetes) |
| `docs/sprints/sprint-5/MV-43-load-testing/README.md` | Brandon (creó el archivo vacío) | Este reporte |

`src/lib/prisma/client.ts` **no se modifica**: el cambio a `max: 20` de la sección 6 fue temporal y se revirtió.

---

## Checklist de calidad

- [x] Prueba ejecutada contra el build de producción (`npm start`).
- [x] Reporte de cuántas solicitudes simultáneas se soportan antes de degradarse (sección 5).
- [x] Causa de la degradación identificada y verificada con un experimento (sección 6).
- [x] Sin escrituras en la base de datos compartida.
- [x] `npx eslint scripts/load-test.mjs` sin errores.
