'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

import Container from '@/components/ui/Container';
import { events } from '@/data/events';
import { EventModality } from '@/types/event';
import EventCard from './EventCard';
import NextEventCountdown from './NextEventCountdown';

type FilterOption = 'todos' | EventModality;

const filters: { value: FilterOption; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'online', label: 'En línea' },
];

export default function EventsSection() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('todos');

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    []
  );

  const nextEvent = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sortedEvents.find((event) => new Date(`${event.date}T00:00:00`) >= today);
  }, [sortedEvents]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'todos') return sortedEvents;
    return sortedEvents.filter((event) => event.modality === activeFilter);
  }, [activeFilter, sortedEvents]);

  return (
    <section aria-labelledby="events-section-title" className="relative overflow-hidden min-h-screen flex flex-col justify-center bg-bgLight dark:bg-bgDark transition-colors duration-300 py-16 sm:py-20 lg:py-24">
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-bgLight to-bgLight dark:from-primary/20 dark:via-bgDark dark:to-bgDark" />
      <div className="absolute -top-[350px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/20 blur-[180px] animate-pulse-slower" />
      <div className="absolute top-20 right-[-300px] w-[700px] h-[700px] rounded-full bg-yellow-400/15 blur-[170px]" />
      <div className="absolute bottom-[350px] left-[-300px] w-[900px] h-[900px] rounded-full bg-green-400/10 blur-[200px]" />
      
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:48px_48px]" />

      <Container size="xl" className="relative z-10">
        <div className="mb-14 text-center max-w-4xl mx-auto animate-fadeUp">
          <h2
            id="events-section-title"
            className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-normal font-heading flex flex-col items-center gap-2"
          >
            <span className="text-black uppercase block">
              Calendario
            </span>
            <span className="bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient block pt-3">
              Próximos eventos y cursos
            </span>
          </h2>
          <p className="mx-auto mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
            Consulta fechas, horarios y modalidad de nuestras próximas sesiones de capacitación.
          </p>
        </div>

        {nextEvent && <NextEventCountdown event={nextEvent} />}

        <div className="mb-8 flex justify-center gap-2">
          {filters.map((filter) => (
            <motion.button
              key={filter.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter.value)}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm font-medium outline-none backdrop-blur-md transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-sm hover:-translate-y-1 hover:shadow-md',
                activeFilter === filter.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-text-secondary hover:border-primary hover:text-primary'
              )}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        <div className="mx-auto flex max-w-4xl flex-col gap-6 animate-fadeUp [animation-delay:200ms]">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <p className="text-center text-sm text-text-secondary">
              No hay eventos disponibles con este filtro.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}