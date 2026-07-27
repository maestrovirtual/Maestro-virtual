'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  GraduationCap,
  MapPin,
  Palette,
  Presentation,
  Smartphone,
  Table,
  Users,
  Video,
} from 'lucide-react';

import Button from '@/components/ui/Button';
import { EventItem } from '@/types/event';
import CourseBackground from '@/features/courses/components/CourseBackground';

interface CategoryStyle {
  label: string;
  color: string;
  bg: string;
  Icon: typeof Video;
  pattern?: "grid" | "waves" | "shapes" | "cards" | "slides";
}

const categoryStyles: Record<EventItem['category'], CategoryStyle> = {
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
}

// Componente local para no modificar el archivo de tu compañero
function CustomEventBackground({ category, color }: { category: string, color: string }) {
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

export default function EventCard({ event }: EventCardProps) {
  const dateObj = new Date(`${event.date}T00:00:00`);
  const day = dateObj.getDate();
  const month = monthNames[dateObj.getMonth()];
  const category = categoryStyles[event.category];
  const CategoryIcon = category.Icon;

  return (
    <motion.article
      whileHover={{ y: -12 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      tabIndex={0}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-5 shadow-xl transition-all duration-500 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:flex-row sm:p-8 outline-none"
    >
      {category.pattern ? (
        <CourseBackground pattern={category.pattern} color={category.color} />
      ) : (
        <CustomEventBackground category={event.category} color={category.color} />
      )}

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-20"
        style={{ background: `linear-gradient(135deg, ${category.color}, transparent)` }}
      />

      <div className="relative flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl shadow-md transition-transform group-hover:scale-110" style={{ backgroundColor: category.color }}>
        <span className="text-xs font-semibold tracking-wide text-white/90">{month}</span>
        <span className="text-xl font-bold text-white">{day}</span>
      </div>

      <div className="relative flex flex-1 flex-col gap-2">
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
            {event.modality === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
            {event.modality === 'online' ? 'En línea' : 'Presencial'}
          </span>
        </div>

        <h3 className="font-heading text-2xl font-bold text-text-primary tracking-wide">
          {event.title}
        </h3>

        <p className="text-sm leading-6 text-muted-foreground">{event.objective}</p>

        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {event.time} · {event.duration}
          </span>

          {event.modality === 'presencial' ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {event.location} — {event.address}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Video className="h-4 w-4" />
              Vía {event.platform}
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {event.participants}
          </span>

          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-end sm:items-end mt-4 sm:mt-0">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button variant="primary" size="sm" className="rounded-full shadow-lg hover:shadow-xl transition-shadow" style={{ backgroundColor: category.color, borderColor: category.color, color: 'white' }}>
            Inscribirse
          </Button>
        </motion.div>
      </div>
    </motion.article>
  );
}