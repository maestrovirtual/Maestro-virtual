'use client';

// Convención Next.js: se envuelve automáticamente como Error Boundary
// alrededor del page.tsx. Si el fetch (o cualquier componente hijo) lanza,
// esta pantalla reemplaza al contenido sin crashear la app entera.

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudOff, RefreshCw, Home } from 'lucide-react';
import { Link } from '@/i18n/navigation';

type CoursesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CoursesError({ error, reset }: CoursesErrorProps) {
  useEffect(() => {
    // El detalle técnico va al log (visible para el equipo en dev tools / Sentry).
    // El usuario NUNCA ve el error crudo.
    console.error('[courses] fallo al cargar:', error);
  }, [error]);

  return (
    <section
      role="alert"
      aria-live="polite"
      className="flex min-h-[70vh] items-center justify-center px-6 py-16"
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
          <CloudOff className="h-10 w-10" aria-hidden />
        </motion.div>

        <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          No pudimos cargar los cursos
        </h2>

        <p className="mt-4 text-base text-text-secondary sm:text-lg">
          Algo se interpuso entre tú y nuestro catálogo. Puede ser una conexión
          intermitente o una pausa de nuestro lado. Intenta de nuevo en unos
          segundos.
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
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:text-primary"
          >
            <Home className="h-4 w-4" aria-hidden />
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
