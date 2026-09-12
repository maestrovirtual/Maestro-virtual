// Loading para /courses/[slug] (MV-27).
// Refleja el layout del detalle: hero grande + stats + description + cta.

export default function CourseDetailLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Cargando curso"
      className="min-h-screen"
    >
      {/* HERO: 2 columnas (contenido izq + imagen der) */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-gradient-to-b from-primary/15 to-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Contenido izq */}
            <div className="space-y-6">
              {/* Breadcrumb */}
              <div className="h-4 w-40 rounded-full bg-primary/10 skeleton-shimmer" />

              {/* Badges */}
              <div className="flex gap-3">
                <div className="h-8 w-20 rounded-full bg-primary/10 skeleton-shimmer" />
                <div className="h-8 w-24 rounded-full bg-primary/10 skeleton-shimmer" />
                <div className="h-8 w-20 rounded-full bg-primary/10 skeleton-shimmer" />
              </div>

              {/* Título grande */}
              <div className="space-y-3">
                <div className="h-14 w-full rounded-2xl bg-primary/10 skeleton-shimmer" />
                <div className="h-14 w-3/4 rounded-2xl bg-primary/10 skeleton-shimmer" />
              </div>

              {/* Descripción */}
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full rounded-full bg-primary/10 skeleton-shimmer" />
                <div className="h-4 w-5/6 rounded-full bg-primary/10 skeleton-shimmer" />
              </div>

              {/* CTAs */}
              <div className="flex gap-4 pt-4">
                <div className="h-12 w-40 rounded-full bg-primary/15 skeleton-shimmer" />
                <div className="h-12 w-36 rounded-full bg-primary/10 skeleton-shimmer" />
              </div>

              {/* Quick stats pills */}
              <div className="flex flex-wrap gap-3 pt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-28 rounded-full bg-primary/10 skeleton-shimmer"
                  />
                ))}
              </div>
            </div>

            {/* Imagen der (círculo grande flotante) */}
            <div className="relative flex justify-center">
              <div className="h-[420px] w-[420px] rounded-[3rem] bg-primary/10 skeleton-shimmer shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS: 4 cards horizontales */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-xl"
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/15 skeleton-shimmer" />
                <div className="mt-5 h-3 w-20 rounded-full bg-primary/10 skeleton-shimmer" />
                <div className="mt-2 h-6 w-32 rounded-lg bg-primary/10 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESCRIPTION: bloque de texto largo */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          <div className="h-8 w-1/3 rounded-lg bg-primary/10 skeleton-shimmer" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-3 rounded-full bg-primary/10 skeleton-shimmer"
                style={{ width: `${90 - i * 5}%` }}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
