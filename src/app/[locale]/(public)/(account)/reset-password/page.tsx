import type { Metadata } from "next";

import AuthCard, { linkClasses } from "@/features/account/AuthCard";
import ResetPasswordForm from "@/features/account/ResetPasswordForm";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Nueva contraseña | Maestro Virtual",
  robots: { index: false, follow: false },
  // El token viaja en la URL: que no se filtre en el Referer de otros sitios.
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;

  if (typeof token !== "string" || !token) {
    return (
      <AuthCard
        title="Enlace incompleto"
        subtitle="Abre el enlace completo que te enviamos por correo"
      >
        <p className="text-center text-sm text-text-secondary">
          <Link href="/forgot-password" className={linkClasses}>
            Pedir un enlace nuevo
          </Link>
        </p>
      </AuthCard>
    );
  }

  return <ResetPasswordForm token={token} locale={locale} />;
}
