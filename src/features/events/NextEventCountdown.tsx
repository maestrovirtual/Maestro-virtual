'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { EventItem } from '@/types/event';

interface NextEventCountdownProps {
  event: EventItem;
}

export default function NextEventCountdown({ event }: NextEventCountdownProps) {
  const eventDate = new Date(`${event.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = eventDate.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-10 mx-auto max-w-4xl flex flex-col items-center gap-4 overflow-hidden rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 px-8 py-8 text-center shadow-xl sm:flex-row sm:justify-between sm:text-left transition-all duration-500 hover:shadow-2xl"
    >
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(24,0,173,0.12),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,191,99,0.16),_transparent_40%)]" />

      <div className="relative flex items-center gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 backdrop-blur-md shadow-sm">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Próximo evento
          </p>
          <h3 className="font-heading text-xl md:text-2xl font-bold tracking-wide text-[#16355B] mt-1">
            {event.title}
          </h3>
        </div>
      </div>

      <div className="relative flex items-center justify-center gap-3 bg-white border border-border px-6 py-4 rounded-2xl shadow-sm my-auto">
        <span className="text-4xl sm:text-5xl font-bold text-primary leading-none">{daysLeft}</span>
        <span className="text-sm font-medium text-text-secondary leading-tight max-w-[80px]">
          {daysLeft === 1 ? 'día para inscribirte' : 'días para inscribirte'}
        </span>
      </div>
    </motion.div>
  );
}