import prisma from "@/lib/prisma/client";
import { verifySessionClaims } from "@/lib/auth/session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

// Igual que checkStaffToken: ademas de la firma, vuelve a leer al usuario en
// la base de datos. Rechaza tokens de staff, cuentas borradas y sesiones
// emitidas antes del ultimo cambio de contraseña.
export async function checkUserToken(token: string | undefined): Promise<CurrentUser | null> {
  const session = await verifySessionClaims(token);
  if (!session || session.role !== "USER") return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, passwordChangedAt: true },
  });
  if (!user || user.role !== "USER") return null;

  // iat va en segundos: se compara contra el segundo del cambio para no
  // rechazar el login que se hace justo despues de restablecer.
  if (
    user.passwordChangedAt &&
    session.issuedAt < Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    return null;
  }

  return { id: user.id, name: user.name, email: user.email };
}
