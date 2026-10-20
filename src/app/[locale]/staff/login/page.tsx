import type { Metadata } from "next";
import { redirect } from "next/navigation";

import StaffLoginForm from "@/features/auth/StaffLoginForm";
import { getStaffUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Acceso staff | Maestro Virtual",
  robots: { index: false, follow: false },
};

export default async function StaffLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Si ya hay una sesion de staff valida, no tiene sentido mostrar el login.
  if (await getStaffUser()) {
    redirect(`/${locale}/admin`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <StaffLoginForm locale={locale} />
    </main>
  );
}
