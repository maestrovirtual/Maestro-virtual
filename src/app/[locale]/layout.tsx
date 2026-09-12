import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AppSplash from "@/components/ui/AppSplash";
import NavigationProgress from "@/components/ui/NavigationProgress";
import ContactRevealOverlay from "@/components/ui/ContactRevealOverlay";
import RouteTransitionFlash from "@/components/ui/RouteTransitionFlash";

import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Maestro Virtual",
  description:
    "Plataforma educativa digital para aprender, conectar y crecer.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  const { locale } = await params;

  // Validar idioma permitido
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
  notFound();
  
  }

  // Cargar traducciones
  const messages = (
    await import(`@/i18n/dictionaries/${locale}.json`)
  ).default;


  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      <AppSplash />
      <NavigationProgress />
      <ContactRevealOverlay />
      <RouteTransitionFlash />

      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </NextIntlClientProvider>
  );
}