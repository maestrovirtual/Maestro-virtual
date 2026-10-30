"use client";

import { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import clsx from "clsx";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock3,
  Compass,
  MapPin,
  Sparkles,
  Video,
} from "lucide-react";

import Card from "@/components/ui/Card";
import type {
  EnrolledCourseItem,
  EnrolledEventItem,
} from "@/features/dashboard/types/dashboard.types";

export interface DashboardTabsProps {
  enrolledCourses: EnrolledCourseItem[];
  enrolledEvents: EnrolledEventItem[];
  locale: string;
}

type ActiveTab = "courses" | "events";

function isExternalUrl(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value.trim()));
}

function formatEventDate(dateInput: Date | string): string {
  try {
    const parsed = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(parsed.getTime())) return String(dateInput);
    return parsed.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return String(dateInput);
  }
}

function EnrolledCourseCard({
  item,
  locale,
}: {
  item: EnrolledCourseItem;
  locale: string;
}) {
  const { course } = item;
  const [imageError, setImageError] = useState(false);

  const imageSrc = !imageError && course.image?.trim() ? course.image.trim() : null;
  const iconSrc = !imageSrc && course.icon?.trim() ? course.icon.trim() : null;
  const accentColor = course.color || "#2563EA";
  const courseHref = `/${locale}/courses/${course.slug}`;

  return (
    <Card
      variant="elevated"
      className="group flex h-full flex-col overflow-hidden rounded-2xl p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Imagen del curso */}
      <div
        className="relative h-48 w-full overflow-hidden bg-slate-100"
        style={{
          background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}08)`,
        }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={isExternalUrl(imageSrc)}
            onError={() => setImageError(true)}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : iconSrc ? (
          <Image
            src={iconSrc}
            alt={course.title}
            fill
            sizes="192px"
            unoptimized={isExternalUrl(iconSrc)}
            className="object-contain p-10 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              className="font-heading text-6xl font-bold opacity-25"
              style={{ color: accentColor }}
            >
              {course.title.charAt(0)}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-transparent" />

        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span
            className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm"
            style={{ color: accentColor }}
          >
            {course.type}
          </span>
        </div>

        <span className="absolute top-3.5 right-3.5 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
          Inscrito
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold tracking-tight text-text-primary line-clamp-1">
          {course.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-text-secondary line-clamp-2">
          {course.shortDescription || course.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {course.duration && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-medium">
              <Clock3
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: accentColor }}
                aria-hidden="true"
              />
              {course.duration}
            </span>
          )}
          {course.modality && (
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 font-medium">
              {course.modality}
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <NextLink
            href={courseHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-95"
          >
            <span>Ir al curso</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </NextLink>
        </div>
      </div>
    </Card>
  );
}

function EnrolledEventCard({
  item,
  locale,
}: {
  item: EnrolledEventItem;
  locale: string;
}) {
  const { event } = item;
  const [imageError, setImageError] = useState(false);

  const imageSrc = !imageError && event.image?.trim() ? event.image.trim() : null;
  const isOnline = event.modality === "ONLINE";
  const externalPlatformUrl = isExternalUrl(event.platform)
    ? event.platform.trim()
    : null;
  const eventHref = externalPlatformUrl ?? `/${locale}/events`;

  return (
    <Card
      variant="elevated"
      className="group flex h-full flex-col overflow-hidden rounded-2xl p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Imagen del evento */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-500/15">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={isExternalUrl(imageSrc)}
            onError={() => setImageError(true)}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-primary/60">
            <Calendar className="h-12 w-12" aria-hidden="true" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-transparent" />

        <span
          className={clsx(
            "absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm",
            isOnline ? "bg-primary" : "bg-emerald-600"
          )}
        >
          {isOnline ? (
            <Video className="h-3 w-3" aria-hidden="true" />
          ) : (
            <MapPin className="h-3 w-3" aria-hidden="true" />
          )}
          {isOnline ? "En línea" : "Presencial"}
        </span>

        <span className="absolute top-3.5 right-3.5 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
          Inscrito
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold tracking-tight text-text-primary line-clamp-1">
          {event.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-text-secondary line-clamp-2">
          {event.objective || event.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-medium">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            {formatEventDate(event.date)}
          </span>

          {event.time && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-medium">
              <Clock3 className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
              {event.time}
            </span>
          )}

          {isOnline && event.platform && !externalPlatformUrl && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-medium">
              <Video className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
              {event.platform}
            </span>
          )}

          {!isOnline && (event.location || event.address) && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              {event.location || event.address}
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          {externalPlatformUrl ? (
            <a
              href={eventHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-95"
            >
              <span>Ir al evento</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <NextLink
              href={eventHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-95"
            >
              <span>Ir al evento</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </NextLink>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/80 px-6 py-16 text-center shadow-sm backdrop-blur-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-text-primary">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
        {description}
      </p>

      <NextLink
        href={ctaHref}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg"
      >
        <Compass className="h-4 w-4" aria-hidden="true" />
        <span>{ctaLabel}</span>
      </NextLink>
    </div>
  );
}

export default function DashboardTabs({
  enrolledCourses,
  enrolledEvents,
  locale,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("courses");

  return (
    <div className="space-y-8">
      {/* Navegación por Pestañas (Tabs) */}
      <div
        role="tablist"
        aria-label="Secciones de mi aprendizaje"
        className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-1.5 shadow-sm"
      >
        <button
          type="button"
          role="tab"
          id="tab-courses"
          aria-selected={activeTab === "courses"}
          aria-controls="panel-courses"
          onClick={() => setActiveTab("courses")}
          className={clsx(
            "inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200",
            activeTab === "courses"
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:bg-background hover:text-text-primary"
          )}
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span>Mis Cursos</span>
          <span
            className={clsx(
              "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",
              activeTab === "courses"
                ? "bg-white/20 text-white"
                : "bg-primary/10 text-primary"
            )}
          >
            {enrolledCourses.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-events"
          aria-selected={activeTab === "events"}
          aria-controls="panel-events"
          onClick={() => setActiveTab("events")}
          className={clsx(
            "inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200",
            activeTab === "events"
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:bg-background hover:text-text-primary"
          )}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>Mis Eventos</span>
          <span
            className={clsx(
              "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",
              activeTab === "events"
                ? "bg-white/20 text-white"
                : "bg-primary/10 text-primary"
            )}
          >
            {enrolledEvents.length}
          </span>
        </button>
      </div>

      {/* Panel: Mis Cursos */}
      {activeTab === "courses" && (
        <section
          role="tabpanel"
          id="panel-courses"
          aria-labelledby="tab-courses"
        >
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((item) => (
                <EnrolledCourseCard
                  key={item.enrollmentId}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Aún no tienes cursos inscritos"
              description="Explora nuestro catálogo educativo e inscríbete con un clic para comenzar a impulsar tus habilidades digitales."
              ctaLabel="Explorar catálogo"
              ctaHref={`/${locale}/courses`}
            />
          )}
        </section>
      )}

      {/* Panel: Mis Eventos */}
      {activeTab === "events" && (
        <section
          role="tabpanel"
          id="panel-events"
          aria-labelledby="tab-events"
        >
          {enrolledEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledEvents.map((item) => (
                <EnrolledEventCard
                  key={item.enrollmentId}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="Aún no tienes eventos inscritos"
              description="Descubre nuestros próximos talleres, conferencias y actividades en vivo para seguir aprendiendo en comunidad."
              ctaLabel="Explorar catálogo"
              ctaHref={`/${locale}/events`}
            />
          )}
        </section>
      )}
    </div>
  );
}

