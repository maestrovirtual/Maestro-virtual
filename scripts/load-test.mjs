// MV-43: Pruebas de carga en la API.
// Sube la concurrencia por niveles contra los endpoints de lectura más usados y reporta
// req/s, latencia (p50/p95/p99) y errores para encontrar dónde se degrada el sistema.
//
// Correr contra el build de producción en local (dev mode compila al vuelo y falsea los tiempos):
//   npm run build && npm start        # en otra terminal
//   npm run test:load
//
// Variables opcionales:
//   LOAD_BASE_URL=http://localhost:3000   LOAD_LEVELS=10,25,50,100,200   LOAD_DURATION=10
//
// Solo hace GET: la inscripción es una Server Action que escribe en la base compartida.

import autocannon from "autocannon";

const BASE_URL = (process.env.LOAD_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const LEVELS = (process.env.LOAD_LEVELS ?? "10,25,50,100,200").split(",").map(Number);
const DURATION = Number(process.env.LOAD_DURATION ?? 10);

// Se considera degradado si falla más del 1% o el p95 pasa de 1 s
const MAX_ERROR_RATE = 0.01;
const MAX_P95_MS = 1000;

const percentil = (ordenados, p) =>
  ordenados.length
    ? Math.round(ordenados[Math.min(ordenados.length - 1, Math.ceil((p / 100) * ordenados.length) - 1)])
    : 0;

function correr(url, conexiones) {
  return new Promise((resolve, reject) => {
    const latencias = [];
    const instancia = autocannon(
      { url, connections: conexiones, duration: DURATION, timeout: 10 },
      (err, res) => (err ? reject(err) : resolve({ res, latencias }))
    );
    instancia.on("response", (_cliente, _status, _bytes, ms) => latencias.push(ms));
  });
}

async function primerSlug() {
  const res = await fetch(`${BASE_URL}/api/courses`);
  if (!res.ok) throw new Error(`GET /api/courses respondió ${res.status}`);
  const cursos = await res.json();
  if (!cursos.length) throw new Error("No hay cursos activos para probar el detalle");
  return cursos[0].slug;
}

async function main() {
  if (!LEVELS.every((n) => Number.isInteger(n) && n > 0) || !(DURATION > 0)) {
    console.error("LOAD_LEVELS debe ser una lista de enteros positivos (ej. 10,25,50) y LOAD_DURATION un número > 0");
    process.exit(1);
  }

  let slug;
  try {
    slug = await primerSlug();
  } catch (e) {
    console.error(`No se pudo contactar ${BASE_URL}: ${e.message}. ¿Está corriendo npm start?`);
    process.exit(1);
  }

  const endpoints = [
    { nombre: "GET /api/courses", ruta: "/api/courses" },
    { nombre: "GET /api/events", ruta: "/api/events" },
    { nombre: "GET /api/courses/[slug]", ruta: `/api/courses/${slug}` },
    { nombre: "Página /es/courses/[slug]", ruta: `/es/courses/${slug}` },
  ];

  console.log(`Base: ${BASE_URL} · niveles: ${LEVELS.join(", ")} · ${DURATION} s por nivel\n`);
  const resumen = [];

  for (const { nombre, ruta } of endpoints) {
    console.log(`### ${nombre}\n`);
    console.log("| Concurrencia | Solicitudes | req/s | p50 (ms) | p95 (ms) | p99 (ms) | Errores | % error |");
    console.log("|---:|---:|---:|---:|---:|---:|---:|---:|");

    let limite = null;
    for (const conexiones of LEVELS) {
      const { res, latencias } = await correr(BASE_URL + ruta, conexiones);
      latencias.sort((a, b) => a - b);
      // res.errors son fallas de conexión (ya incluye los timeouts); res.non2xx, respuestas 4xx/5xx
      const errores = res.non2xx + res.errors;
      const total = res.requests.total + res.errors;
      const tasaError = total ? errores / total : 0;
      const p95 = percentil(latencias, 95);

      console.log(
        `| ${conexiones} | ${total} | ${res.requests.average.toFixed(0)} | ${percentil(latencias, 50)} | ${p95} | ` +
          `${percentil(latencias, 99)} | ${errores} | ${(tasaError * 100).toFixed(1)}% |`
      );

      if (limite === null && (tasaError > MAX_ERROR_RATE || p95 > MAX_P95_MS)) limite = conexiones;
      // Pausa para que el pool de conexiones a la BD se libere entre niveles
      await new Promise((r) => setTimeout(r, 3000));
    }

    resumen.push({ nombre, limite });
    console.log();
  }

  console.log("### Resumen\n");
  console.log(`Degradado = más de ${MAX_ERROR_RATE * 100}% de errores o p95 mayor a ${MAX_P95_MS} ms.\n`);
  console.log("| Endpoint | Se degrada a partir de |");
  console.log("|---|---|");
  for (const { nombre, limite } of resumen) {
    console.log(`| ${nombre} | ${limite ? `${limite} simultáneas` : `no se degradó hasta ${LEVELS.at(-1)}`} |`);
  }
}

main();
