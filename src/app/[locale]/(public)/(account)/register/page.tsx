import type { Metadata } from "next";
import { redirect } from "next/navigation";

import RegisterForm from "@/features/account/RegisterForm";
import { safeNextPath } from "@/lib/auth/account";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Crear cuenta | Maestro Virtual",
};

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;

  // Con sesion abierta no tiene sentido registrarse; /login muestra la cuenta.
  if (await getCurrentUser()) {
    redirect(`/${locale}/login`);
  }

  return <RegisterForm next={safeNextPath(next, `/${locale}`)} />;
}
