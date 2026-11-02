import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import { getStaffUser } from "@/lib/auth/dal";

// Respaldo de la proteccion del panel. La barrera principal es src/proxy.ts:
// Next renderiza layout y pagina en paralelo, asi que esta redireccion no
// impide que la pagina se procese. Las paginas que lean datos reales deben
// verificar la sesion junto a la consulta (getStaffUser / requireStaffApi).
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const staff = await getStaffUser();

  if (!staff) {
    const safeLocale = (routing.locales as readonly string[]).includes(locale)
      ? locale
      : routing.defaultLocale;
    redirect(`/${safeLocale}/staff/login`);
  }

  return children;
}
