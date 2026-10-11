import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";

// Crea un usuario staff o promueve uno existente (MV-33).
//
// Uso:  npm run staff:create
//       npm run staff:create -- --email ana@maestrovirtual.org --name "Ana Lopez"
//
// La contraseña se pide oculta en la terminal. En entornos sin terminal
// interactiva se puede pasar con la variable STAFF_PASSWORD.

const MIN_PASSWORD_LENGTH = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

function askHidden(question: string): Promise<string> {
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    return Promise.reject(
      new Error("No hay terminal interactiva: define la contraseña en STAFF_PASSWORD.")
    );
  }

  return new Promise((resolve) => {
    let value = "";
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const finish = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
      process.stdout.write("\n");
    };

    function onData(chunk: string) {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          finish();
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          finish();
          process.exit(130);
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
        } else {
          value += char;
        }
      }
    }

    stdin.on("data", onData);
  });
}

async function readPassword(): Promise<string> {
  if (process.env.STAFF_PASSWORD) return process.env.STAFF_PASSWORD;

  const password = await askHidden(`Contraseña (minimo ${MIN_PASSWORD_LENGTH} caracteres): `);
  const confirmation = await askHidden("Confirma la contraseña: ");
  if (password !== confirmation) throw new Error("Las contraseñas no coinciden.");
  return password;
}

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
    },
  });

  const email = (values.email ?? (await ask("Correo del staff: "))).trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new Error(`Correo invalido: "${email}"`);

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  });

  const name = (values.name ?? existing?.name ?? (await ask("Nombre completo: "))).trim();
  if (!name) throw new Error("El nombre es obligatorio.");

  const password = await readPassword();
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    create: { email, name, hashedPassword, role: Role.STAFF },
    update: { name, hashedPassword, role: Role.STAFF },
  });

  console.log(
    existing
      ? `Usuario ${email} actualizado: ahora es STAFF y su contraseña fue reemplazada.`
      : `Usuario staff ${email} creado.`
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
