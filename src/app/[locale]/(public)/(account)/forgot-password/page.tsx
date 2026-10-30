import type { Metadata } from "next";

import ForgotPasswordForm from "@/features/account/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña | Maestro Virtual",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ForgotPasswordForm locale={locale} />;
}
