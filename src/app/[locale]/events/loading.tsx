// Loading skeleton para /events (MV-27).
// Refleja el layout real: hero + countdown + 3 filtros + lista horizontal de eventos.

export default function EventsLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Cargando eventos"
      className="relative min-h-screen overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      {/* Fondo suave, mismo estilo que EventsSection */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO: título + subtítulo */}
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <div className="mx-auto h-14 w-3/4 rounded-2xl bg-primary/10 skeleton-shimmer" />
          <div className="mx-auto h-8 w-2/3 rounded-full bg-primary/10 skeleton-shimmer" />
          <div className="mx-auto h-4 w-1/2 rounded-full bg-primary/10 skeleton-shimmer" />
        </div>

        {/* Countdown al próximo evento */}
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div className="h-4 w-40 rounded-full bg-primary/10 skeleton-shimmer" />
          <div className="mt-3 h-8 w-2/3 rounded-full bg-primary/10 skeleton-shimmer" />
          <div className="mt-6 flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 space-y-2">
                <div className="h-12 rounded-xl bg-primary/10 skeleton-shimmer" />
                <div className="mx-auto h-3 w-12 rounded-full bg-primary/10 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Filtros: Todos / Presencial / En línea */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-full bg-primary/10 skeleton-shimmer"
            />
          ))}
        </div>

        {/* Lista de eventos: 4 cards horizontales, forma de EventCard */}
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-3xl border border-white/40 bg-white/80 p-5 shadow-xl backdrop-blur-xl sm:flex-row sm:p-8"
            >
              {/* Bloque fecha izq (16x16 en real) */}
              <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-primary/15 skeleton-shimmer" />

              {/* Contenido central */}
              <div className="flex flex-1 flex-col gap-3">
                {/* 2 badges (categoría + modalidad) */}
                <div className="flex gap-2">
                  <div className="h-6 w-24 rounded-full bg-primary/10 skeleton-shimmer" />
                  <div className="h-6 w-20 rounded-full bg-primary/10 skeleton-shimmer" />
                </div>

                {/* Título */}
                <div className="h-7 w-3/4 rounded-lg bg-primary/10 skeleton-shimmer" />

                {/* Descripción */}
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-primary/10 skeleton-shimmer" />
                  <div className="h-3 w-5/6 rounded-full bg-primary/10 skeleton-shimmer" />
                </div>

                {/* Meta (horario, lugar, cupo, fecha) */}
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-3 w-24 rounded-full bg-primary/10 skeleton-shimmer"
                    />
                  ))}
                </div>
              </div>

              {/* Botón "Inscribirse" (der) */}
              <div className="flex items-end justify-end">
                <div className="h-10 w-28 rounded-full bg-primary/15 skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
