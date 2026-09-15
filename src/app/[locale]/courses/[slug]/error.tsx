'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookX, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';

type CourseDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CourseDetailError({ error, reset }: CourseDetailErrorProps) {
  useEffect(() => {
    console.error('[course-detail] fallo al cargar:', error);
  }, [error]);

  return (
    <main
      role="alert"
      aria-live="polite"
      className="flex min-h-[80vh] items-center justify-center px-6 py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-lg flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <BookX className="h-10 w-10" aria-hidden />
        </motion.div>

        <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          No pudimos abrir este curso
        </h2>

        <p className="mt-4 text-base text-text-secondary sm:text-lg">
          Puede ser una conexión intermitente o que el curso haya cambiado de
          lugar. Intenta de nuevo, o vuelve al listado para elegir otro.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Reintentar
          </button>

          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver a cursos
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
