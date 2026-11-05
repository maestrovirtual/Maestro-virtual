'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Compass,
  GraduationCap,
  MapPin,
  Maximize2,
  Palette,
  Presentation,
  Smartphone,
  Table,
  Users,
  Video,
} from 'lucide-react';

import { EventItem } from '@/types/event';
import CourseBackground from '@/features/courses/components/CourseBackground';
import EnrollButton from '@/features/enrollments/components/EnrollButton';
import EventDetailModal from './EventDetailModal';

interface CategoryStyle {
  label: string;
  color: string;
  bg: string;
  Icon: typeof Video;
  pattern?: "grid" | "waves" | "shapes" | "cards" | "slides";
}

const defaultCategoryStyle: CategoryStyle = {
  label: 'General',
  color: '#2563EB',
  bg: '#2563EB14',
  Icon: Calendar,
  pattern: "grid",
};

const categoryStyles: Record<string, CategoryStyle> = {
  general: defaultCategoryStyle,
  tecnologia: { label: 'Tecnología', color: '#0284C7', bg: '#0284C714', Icon: Presentation, pattern: "grid" },
  educacion: { label: 'Educación', color: '#7C3AED', bg: '#7C3AED14', Icon: GraduationCap, pattern: "cards" },
  zoom: { label: 'Zoom', color: '#185ABD', bg: '#185ABD14', Icon: Video, pattern: "waves" },
  excel: { label: 'Excel', color: '#00BF63', bg: '#00BF6314', Icon: Table, pattern: "grid" },
  powerpoint: { label: 'PowerPoint', color: '#F97316', bg: '#F9731614', Icon: Presentation, pattern: "slides" },
  canva: { label: 'Canva', color: '#7a4aff', bg: '#7a4aff14', Icon: Palette, pattern: "shapes" },
  classroom: { label: 'Google Classroom', color: '#ffd04f', bg: '#ffd04f14', Icon: GraduationCap, pattern: "cards" },
  emprendimiento: { label: 'Inclusión: Emprendimiento', color: '#334155', bg: '#F8FAFC', Icon: Users },
  alfabetizacion: { label: 'Inclusión: Alfabetización', color: '#00BF63', bg: '#00BF6314', Icon: Smartphone },
};

const monthNames = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

interface EventCardProps {
  event: EventItem;
  isEnrolled?: boolean;
  isLoggedIn?: boolean;
  currentPath?: string;
}

// Componente local para fondos temáticos de inclusión
function CustomEventBackground({ category, color }: { category?: string; color: string }) {
  if (category === 'emprendimiento') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-4 right-10 flex items-end gap-2 opacity-[0.12]">
          <div className="w-8 h-12 rounded-t-xl animate-fadeUp" style={{ backgroundColor: color }} />
          <div className="w-8 h-20 rounded-t-xl animate-fadeUp [animation-delay:200ms]" style={{ backgroundColor: color }} />
          <div className="w-8 h-32 rounded-t-xl animate-fadeUp [animation-delay:400ms]" style={{ backgroundColor: color }} />
          <div className="w-8 h-48 rounded-t-xl animate-fadeUp [animation-delay:600ms]" style={{ backgroundColor: color }} />
        </div>
        <div className="absolute top-10 right-32 w-16 h-16 rounded-full opacity-[0.08] animate-pulse" style={{ backgroundColor: color }} />
      </div>
    );
  }

  if (category === 'alfabetizacion') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-8 right-12 opacity-[0.12]">
          <div className="relative w-28 h-20 rounded-[2rem] rounded-br-md animate-slideFloat" style={{ backgroundColor: color }} />
          <div className="absolute top-14 -left-12 w-20 h-14 rounded-3xl rounded-bl-md animate-slideFloat [animation-delay:300ms]" style={{ backgroundColor: color, opacity: 0.8 }} />
        </div>
        <div className="absolute bottom-6 right-40 w-24 h-24 rounded-full border-[10px] opacity-[0.08] animate-wave" style={{ borderColor: color }} />
      </div>
    );
  }

  return null;
}

export default function EventCard({
  event,
  isEnrolled = false,
  isLoggedIn = false,
  currentPath = '/events',
}: EventCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const safeDateStr = String(event.date || '');
  const dateObj = safeDateStr.includes('T')
    ? new Date(safeDateStr)
    : new Date(`${safeDateStr}T00:00:00`);

  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const day = validDate.getDate();
  const month = monthNames[validDate.getMonth()] || 'ENE';

  const rawCategoryKey = String(event.category || 'general').toLowerCase().trim();
  const matchedCategory = categoryStyles[rawCategoryKey];
  const category = matchedCategory ?? {
    ...defaultCategoryStyle,
    label: event.category ? (event.category.charAt(0).toUpperCase() + event.category.slice(1)) : 'General',
  };
  const CategoryIcon = category.Icon ?? Calendar;
  const isOnline = String(event.modality).toLowerCase() === 'online';
  const hasImage = Boolean(event.image && event.image.trim() !== '');

  return (
    <>
      <motion.article
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.995 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        tabIndex={0}
        className="group relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-5 sm:p-7 shadow-xl transition-all duration-500 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:flex-row md:items-stretch outline-none"
      >
        {category.pattern ? (
          <CourseBackground pattern={category.pattern} color={category.color} />
        ) : (
          <CustomEventBackground category={rawCategoryKey} color={category.color} />
        )}

        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-20"
          style={{ background: `linear-gradient(135deg, ${category.color}, transparent)` }}
        />

        {hasImage && event.image ? (
          /* ========================================================================= */
          /* CASO 1: EVENTO CON IMAGEN/AFICHE DESTACADO (GRANDE Y ÓPTIMO)              */
          /* ========================================================================= */
          <>
            {/* AFICHE GRANDE */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsDetailOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsDetailOpen(true);
                }
              }}
              title="Clic para ver afiche completo en alta resolución"
              className="group/img relative w-full md:w-72 lg:w-80 xl:w-96 h-64 sm:h-72 md:h-auto md:min-h-[270px] shrink-0 rounded-2xl overflow-hidden bg-slate-950/5 dark:bg-black/30 border border-slate-200/70 dark:border-white/10 flex items-center justify-center p-2 cursor-pointer shadow-inner hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Image
                src={event.image}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 380px, 420px"
                className="object-contain p-2 transition-transform duration-500 group-hover/img:scale-[1.02]"
                unoptimized={event.image.startsWith('http')}
              />

              {/* BADGE DE FECHA FLOTANTE EN EL AFICHE */}
              <div
                className="absolute top-3 left-3 flex h-14 w-14 flex-col items-center justify-center rounded-xl shadow-lg backdrop-blur-md transition-transform group-hover/img:scale-105 z-10"
                style={{ backgroundColor: category.color }}
              >
                <span className="text-[11px] font-semibold tracking-wide text-white/90 leading-tight">{month}</span>
                <span className="text-lg font-bold text-white leading-tight">{day}</span>
              </div>

              {/* OVERLAY PARA AMPLIAR */}
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 flex items-center justify-center transition-colors">
                <span className="opacity-0 group-hover/img:opacity-100 bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity flex items-center gap-1.5 shadow-lg transform translate-y-1 group-hover/img:translate-y-0 duration-200">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Ampliar afiche
                </span>
              </div>
            </div>

            {/* CONTENIDO Y DETALLES */}
            <div className="relative flex flex-1 flex-col justify-between gap-4 min-w-0">
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold shadow-sm"
                    style={{ color: category.color }}
                  >
                    <CategoryIcon className="h-3 w-3" />
                    {category.label}
                  </span>
                  <span
                    className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold shadow-sm text-text-secondary"
                  >
                    {isOnline ? <Video className="h-3 w-3 text-blue-500" /> : <MapPin className="h-3 w-3 text-emerald-500" />}
                    {isOnline ? 'En línea' : 'Presencial'}
                  </span>
                </div>

                <h3 className="font-heading text-2xl lg:text-3xl font-bold text-text-primary tracking-wide">
                  {event.title}
                </h3>

                <p className="text-sm leading-6 text-muted-foreground line-clamp-3">
                  {event.objective || (event as unknown as { description?: string }).description || 'Próximamente más información sobre este evento.'}
                </p>

                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {event.time || 'Por definir'}{event.duration ? ` · ${event.duration}` : ''}
                  </span>

                  {!isOnline ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      {event.location ? `${event.location}${event.address ? ` — ${event.address}` : ''}` : (event.address || 'Presencial')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-blue-500" />
                      Vía {event.platform || 'En línea'}
                    </span>
                  )}

                  {event.participants && (
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {event.participants}
                    </span>
                  )}

                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {validDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(true)}
                  className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-white/15 bg-surface/90 px-5 py-2.5 text-xs font-semibold text-text-primary shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-background hover:border-primary/40 hover:-translate-y-0.5 hover:shadow cursor-pointer"
                >
                  <Compass className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Explorar evento</span>
                </button>

                <EnrollButton
                  itemId={event.id}
                  itemType="EVENT"
                  isEnrolled={isEnrolled}
                  isLoggedIn={isLoggedIn}
                  currentPath={currentPath}
                  accentColor={category.color}
                  label="Inscribirse"
                  className="flex-1 sm:flex-none px-5 py-2.5 text-xs"
                />
              </div>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* CASO 2: EVENTO SIN IMAGEN (LAYOUT COMPACTO ELEGANTE)                      */
          /* ========================================================================= */
          <>
            {/* BADGE DE FECHA */}
            <div
              className="relative flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl shadow-md transition-transform group-hover:scale-105"
              style={{ backgroundColor: category.color }}
            >
              <span className="text-xs font-semibold tracking-wide text-white/90">{month}</span>
              <span className="text-xl font-bold text-white">{day}</span>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="relative flex flex-1 flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold shadow-sm"
                  style={{ color: category.color }}
                >
                  <CategoryIcon className="h-3 w-3" />
                  {category.label}
                </span>
                <span
                  className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold shadow-sm text-text-secondary"
                >
                  {isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                  {isOnline ? 'En línea' : 'Presencial'}
                </span>
              </div>

              <h3 className="font-heading text-2xl font-bold text-text-primary tracking-wide">
                {event.title}
              </h3>

              <p className="text-sm leading-6 text-muted-foreground line-clamp-2">
                {event.description || event.objective || 'Próximamente más información sobre este evento.'}
              </p>

              <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {event.time || 'Por definir'}{event.duration ? ` · ${event.duration}` : ''}
                </span>

                {!isOnline ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {event.location ? `${event.location}${event.address ? ` — ${event.address}` : ''}` : (event.address || 'Presencial')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Video className="h-4 w-4" />
                    Vía {event.platform || 'En línea'}
                  </span>
                )}

                {event.participants && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {event.participants}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {validDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="relative flex flex-col items-stretch sm:items-end justify-center gap-2 shrink-0 mt-2 md:mt-0">
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(true)}
                  className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-white/15 bg-surface/90 px-4 py-2.5 text-xs font-semibold text-text-primary shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-background hover:border-primary/40 hover:-translate-y-0.5 hover:shadow cursor-pointer"
                >
                  <Compass className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Explorar evento</span>
                </button>

                <EnrollButton
                  itemId={event.id}
                  itemType="EVENT"
                  isEnrolled={isEnrolled}
                  isLoggedIn={isLoggedIn}
                  currentPath={currentPath}
                  accentColor={category.color}
                  label="Inscribirse"
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs"
                />
              </div>
            </div>
          </>
        )}
      </motion.article>

      <EventDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        event={event}
        categoryColor={category.color}
        categoryLabel={category.label}
        isEnrolled={isEnrolled}
        isLoggedIn={isLoggedIn}
        currentPath={currentPath}
      />
    </>
  );
}
