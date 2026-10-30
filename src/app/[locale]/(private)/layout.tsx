import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/dal";

export default async function PrivateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;

  const session = await getCurrentUser();
  if (!session) {
    redirect(`/${safeLocale}/login`);
  }

  return (
    <>
      <Navbar session={session} userName={session.name} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

