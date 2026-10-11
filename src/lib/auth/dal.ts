import { cache } from "react";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma/client";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
};

type StaffCheck =
  | { status: "ok"; user: StaffUser }
  | { status: "unauthenticated" }
  | { status: "forbidden" };

// Verificacion con autoridad: ademas de validar la firma de la cookie,
// vuelve a leer el rol en la base de datos. Asi, si a alguien le quitan
// el rol STAFF, pierde el acceso aunque su cookie siga vigente.
async function checkStaff(): Promise<StaffCheck> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
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

// Para paginas y layouts del panel.
export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  const result = await checkStaff();
  return result.status === "ok" ? result.user : null;
});

// Para Route Handlers: devuelve la respuesta de error, o null si es staff.
export async function requireStaffApi(): Promise<NextResponse | null> {
  const result = await checkStaff();

  if (result.status === "unauthenticated") {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (result.status === "forbidden") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}
