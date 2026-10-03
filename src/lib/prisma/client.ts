import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// 1. Creamos el pool de conexiones con la URL de Supabase y configuramos timeouts para evitar que se quede colgada
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // Tiempo máximo para conectar (5s)
  max: 10, // Máximo número de conexiones en el pool
});

// 2. Le pasamos el pool al adaptador de Postgres de Prisma
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;