import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import type { Course, Event } from "@prisma/client";

import Container from "@/components/ui/Container";
import DashboardTabs from "@/features/dashboard/components/DashboardTabs";
import type {
  EnrolledCourseItem,
  EnrolledEventItem,
  EnrollmentWithRelations,
} from "@/features/dashboard/types/dashboard.types";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/dal";
import prisma from "@/lib/prisma/client";

export const metadata: Metadata = {
  title: "Mi Dashboard | Maestro Virtual",
  description:
    "Consulta tus cursos y eventos inscritos en tu panel personal de aprendizaje.",
};

export default async function UserDashboardPage({
  params,
}: {
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

  const enrollments: EnrollmentWithRelations[] =
    await prisma.enrollment.findMany({
      where: {
        userId: session.id,
        status: "REGISTERED",
      },
      include: {
        course: true,
        event: true,
      },
      orderBy: {
        date: "desc",
      },
    });

  const enrolledCourses: EnrolledCourseItem[] = enrollments
    .filter(
      (
        enrollment
      ): enrollment is EnrollmentWithRelations & { course: Course } =>
        enrollment.course !== null
    )
    .map((enrollment) => ({
      enrollmentId: enrollment.id,
      enrolledAt: enrollment.date.toISOString(),
      course: enrollment.course,
    }));

  const enrolledEvents: EnrolledEventItem[] = enrollments
    .filter(
      (enrollment): enrollment is EnrollmentWithRelations & { event: Event } =>
        enrollment.event !== null
    )
    .map((enrollment) => ({
      enrollmentId: enrollment.id,
      enrolledAt: enrollment.date.toISOString(),
      event: enrollment.event,
    }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-28 pb-20">
      {/* Resplandor decorativo de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <Container size="xl" className="relative space-y-10">
        {/* Encabezado del Dashboard */}
        <header className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-sm backdrop-blur-xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mi Dashboard</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Mi Panel de Aprendizaje
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
              Hola, <span className="font-semibold text-text-primary">{session.name}</span>. Aquí puedes acceder rápidamente a los cursos y eventos en los que te has inscrito.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xl font-bold leading-none text-text-primary">
                  {enrolledCourses.length}
                </p>
                <p className="mt-1 text-xs font-medium text-text-secondary">
                  {enrolledCourses.length === 1 ? "Curso activo" : "Cursos activos"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xl font-bold leading-none text-text-primary">
                  {enrolledEvents.length}
                </p>
                <p className="mt-1 text-xs font-medium text-text-secondary">
                  {enrolledEvents.length === 1 ? "Evento activo" : "Eventos activos"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Secciones Mis Cursos y Mis Eventos */}
        <DashboardTabs
          enrolledCourses={enrolledCourses}
          enrolledEvents={enrolledEvents}
          locale={safeLocale}
        />
      </Container>
    </div>
  );
}

