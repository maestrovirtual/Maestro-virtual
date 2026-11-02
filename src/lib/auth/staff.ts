import prisma from "@/lib/prisma/client";
import { verifySessionToken } from "@/lib/auth/session";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
};

export type StaffCheck =
  | { status: "ok"; user: StaffUser }
  | { status: "unauthenticated" }
  | { status: "forbidden" };

// Verificacion con autoridad: ademas de validar la firma del token,
// vuelve a leer el rol en la base de datos. Asi, si a alguien le quitan
// el rol STAFF, pierde el acceso aunque su cookie siga vigente.
export async function checkStaffToken(token: string | undefined): Promise<StaffCheck> {
  const session = await verifySessionToken(token);
  if (!session) return { status: "unauthenticated" };
  if (session.role !== "STAFF") return { status: "forbidden" };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) return { status: "unauthenticated" };
  if (user.role !== "STAFF") return { status: "forbidden" };

  return { status: "ok", user: { id: user.id, name: user.name, email: user.email } };
}
