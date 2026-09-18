import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // OJO: esta url la usa SOLO el CLI (migrate, db seed, studio)
    // El pooler en modo "transaccion" (puerto 6543, pgbouncer) no soporta
    // los advisory locks que usan las migraciones. 
    // Por eso aquí asignamos explícitamente el DIRECT_URL a la propiedad 'url'.
    // En Prisma 7, la propiedad 'directUrl' ya no existe.
    url: process.env.DIRECT_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});