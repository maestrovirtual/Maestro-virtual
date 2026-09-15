import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Sin "npx" al frente: Prisma spawnea este comando directo y agrega
    // node_modules/.bin al PATH solo. Con "npx tsx ..." se agrega una capa
    // extra (resolver/spawnear npx) que en Windows puede tronar con
    // ENOENT. Como tsx ya esta en devDependencies, "tsx" solo basta.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // OJO: esta url la usa SOLO el CLI (migrate, db seed, studio), no la
    // app en runtime. El pooler en modo "transaccion" (puerto 6543,
    // pgbouncer) no soporta los advisory locks que usan las migraciones
    // -> se cuelga en silencio, sin error. Por eso aqui usamos la
    // conexion directa/sesion (puerto 5432, variable DIRECT_URL).
    // La app en runtime sigue usando DATABASE_URL (6543) desde
    // src/lib/prisma/client.ts, sin cambios.
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});