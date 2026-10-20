import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { checkStaffToken } from "@/lib/auth/staff";

const intlMiddleware = createMiddleware(routing);

// Rutas que antes declaraba el matcher para next-intl: "/" y "/(es|en)/:path*".
const INTL_PATH = /^\/(?:(?:es|en)(?:\/.*)?)?$/;

// Cualquier ruta que Next resuelva a src/app/[locale]/admin, incluidos
// idiomas no soportados (/fr/admin): Next renderiza layout y pagina en
// paralelo, asi que una redireccion en el layout no evita que el contenido
// de la pagina viaje en la respuesta. Por eso la barrera es este proxy.
const ADMIN_PATH = /^\/([^/]+)\/admin(?:\/|$)/i;

function decodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function loginLocale(segment: string): string {
  const locale = segment.toLowerCase();
  return (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminMatch = decodePathname(pathname).match(ADMIN_PATH);

  if (adminMatch) {
    const result = await checkStaffToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (result.status !== "ok") {
      const loginUrl = new URL(`/${loginLocale(adminMatch[1])}/staff/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (INTL_PATH.test(pathname)) {
    return intlMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  // Todas las rutas de paginas (sin API, archivos internos de Next ni
  // archivos estaticos) para que ninguna variante de /admin escape.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
