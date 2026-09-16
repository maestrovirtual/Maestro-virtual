// Este archivo es una convención de Next.js App Router:
// se muestra automáticamente mientras el page.tsx (async) espera datos.
// Cuando la data llega, Next lo destruye y monta el contenido real.
//
// Reproduce la forma final (hero + grid de cards) para evitar layout shift
// y transmitir sensación de rapidez.

export default function CoursesLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Cargando cursos"
      className="min-h-screen"
    >
      {/* HERO SKELETON: espejo de CoursesHero */}
      <div className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="relative mx-auto max-w-4xl px-6 text-center space-y-6">
          <div className="mx-auto h-6 w-40 rounded-full bg-primary/15 skeleton-shimmer" />
          <div className="mx-auto h-14 w-3/4 rounded-2xl bg-primary/10 skeleton-shimmer" />
          <div className="mx-auto h-4 w-2/3 rounded-full bg-primary/10 skeleton-shimmer" />
          <div className="mx-auto h-4 w-1/2 rounded-full bg-primary/10 skeleton-shimmer" />
        </div>
      </div>

      {/* GRID SKELETON: espejo de CourseGrid */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 space-y-10">
        {/* Filtros de categoría (chips) */}
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-full bg-primary/10 skeleton-shimmer"
            />
          ))}
        </div>

        {/* 6 card skeletons con la MISMA forma de CourseCard */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
            >
              {/* Imagen: h-56 como el CourseCard real */}
              <div className="relative h-56 w-full bg-primary/10 skeleton-shimmer" />

              {/* Contenido */}
              <div className="flex flex-1 flex-col p-6">
                {/* Título */}
                <div className="h-7 w-3/4 rounded-lg bg-primary/10 skeleton-shimmer" />

                {/* Descripción (2 líneas) */}
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded-full bg-primary/10 skeleton-shimmer" />
                  <div className="h-3 w-5/6 rounded-full bg-primary/10 skeleton-shimmer" />
                </div>

                {/* Pills (duration + stage) */}
                <div className="mt-5 flex gap-3">
                  <div className="h-8 w-24 rounded-full bg-primary/10 skeleton-shimmer" />
                  <div className="h-8 w-20 rounded-full bg-primary/10 skeleton-shimmer" />
                </div>

                {/* Footer: "Explorar curso" */}
                <div className="mt-auto pt-6 flex items-center justify-between">
                  <div className="h-4 w-28 rounded-full bg-primary/15 skeleton-shimmer" />
                  <div className="h-6 w-6 rounded-full bg-primary/15 skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
