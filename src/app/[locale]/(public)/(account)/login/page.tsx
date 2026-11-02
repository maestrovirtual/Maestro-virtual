import type { Metadata } from "next";

import LoginForm from "@/features/account/LoginForm";
import SignedInCard from "@/features/account/SignedInCard";
import { safeNextPath } from "@/lib/auth/account";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Iniciar sesión | Maestro Virtual",
};

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string | string[]; reset?: string | string[] }>;
}) {
  const { locale } = await params;
  const { next, reset } = await searchParams;

  const user = await getCurrentUser();
  if (user) {
    return <SignedInCard user={user} locale={locale} />;
  }

  return <LoginForm next={safeNextPath(next, `/${locale}`)} passwordReset={reset === "1"} />;
}
