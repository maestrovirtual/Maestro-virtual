import { cache } from "react";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE, USER_SESSION_COOKIE } from "@/lib/auth/session";
import { checkStaffToken, type StaffUser } from "@/lib/auth/staff";
import { checkUserToken, type CurrentUser } from "@/lib/auth/user";

async function checkStaff() {
  return checkStaffToken((await cookies()).get(SESSION_COOKIE)?.value);
}

// Para paginas y layouts del panel.
export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  const result = await checkStaff();
  return result.status === "ok" ? result.user : null;
});

// Para paginas de usuarios finales (MV-36): null si no hay sesion valida.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  return checkUserToken((await cookies()).get(USER_SESSION_COOKIE)?.value);
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
