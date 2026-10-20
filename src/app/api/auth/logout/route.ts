import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/session";

// Toma el idioma de la pagina desde donde se cerro sesion (Referer) para
// regresar al login en ese mismo idioma.
function resolveLocale(request: Request): string {
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const segment = new URL(referer).pathname.split("/")[1];
      if ((routing.locales as readonly string[]).includes(segment)) return segment;
    } catch {
      // Referer malformado: se usa el idioma por defecto.
    }
  }
  return routing.defaultLocale;
}

// ==========================================
// POST: Cerrar sesion de staff
// ==========================================
export async function POST(request: Request) {
  const loginUrl = new URL(`/${resolveLocale(request)}/staff/login`, request.url);

  // 303 para que el navegador siga la redireccion con GET despues del POST del formulario.
  const response = NextResponse.redirect(loginUrl, 303);
  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return response;
}
