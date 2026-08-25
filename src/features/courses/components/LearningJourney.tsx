import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function CoursesHero() {
  return (
    <section aria-labelledby="courses-hero-title" className="py-8 sm:py-10 lg:py-12">
      <Container size="xl">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-[#F4F7FF] via-white to-[#EEF2FF] shadow-[0_20px_60px_rgba(24,0,173,0.08)]">
          <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-14">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Ruta de aprendizaje moderna
              </div>

              <h2
                id="courses-hero-title"
                className="max-w-3xl text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
              >
                Aprende con cursos que impulsan tu futuro profesional
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
                Explora programas claros, prácticos y diseñados para ayudarte a crecer con confianza en inteligencia artificial, tecnología y diseño.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="primary" size="lg" className="min-w-[180px]">
                  <span>Explorar cursos</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="min-w-[180px]">
                  <PlayCircle className="h-4 w-4" />
                  <span>Conocer más</span>
                </Button>
              </div>
            </div>

            <div className="relative flex min-h-[320px] items-center justify-center rounded-[1.5rem] border border-border/70 bg-white/70 p-6 sm:p-8">
              <div className="absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,_rgba(24,0,173,0.12),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,191,99,0.16),_transparent_40%)]" />
              <div className="absolute left-6 top-6 h-24 w-24 rounded-full bg-brand-yellow/30 blur-3xl" />
              <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full bg-primary/15 blur-3xl" />

              <div className="relative w-full max-w-[420px] rounded-[1.5rem] border border-border bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Learning path
                  </span>
                  <span className="text-sm font-medium text-text-secondary">+ 12 cursos</span>
                </div>

                <div className="mt-6 space-y-3">
                  {["Fundamentos", "Práctica guiada", "Certificación"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{item}</p>
                        <p className="text-sm text-text-secondary">Etapa {index + 1} del plan</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
