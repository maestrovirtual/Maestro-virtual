import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { sessionCookieOptions, USER_SESSION_COOKIE } from "@/lib/auth/session";

// El formulario de "Cerrar sesión" manda el idioma en un campo oculto para
// regresar al login en ese mismo idioma.
async function resolveLocale(request: Request): Promise<string> {
  try {
    const locale = (await request.formData()).get("locale");
    if (typeof locale === "string" && (routing.locales as readonly string[]).includes(locale)) {
      return locale;
    }
  } catch {
    // Sin cuerpo de formulario: se usa el idioma por defecto.
  }
  return routing.defaultLocale;
}

// ==========================================
// POST: Cerrar sesion de un usuario final
// ==========================================
export async function POST(request: Request) {
  const loginUrl = new URL(`/${await resolveLocale(request)}/login`, request.url);

  // 303 para que el navegador siga la redireccion con GET despues del POST del formulario.
  const response = NextResponse.redirect(loginUrl, 303);
  response.cookies.set(USER_SESSION_COOKIE, "", sessionCookieOptions(0));
  return response;
}
