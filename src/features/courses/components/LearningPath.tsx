import Container from '@/components/ui/Container';

export default function LearningPath() {
  return (
    <section aria-labelledby="learning-path-title" className="py-8 sm:py-10">
      <Container size="xl">
        <div className="space-y-4">
          <h2 id="learning-path-title" className="text-2xl font-semibold tracking-tight text-text-primary">
            Ruta de aprendizaje
          </h2>
          <div className="rounded-2xl border border-border bg-background/70 p-6 text-sm text-text-secondary">
            Próximamente: recorrido guiado por niveles, módulos o pasos de aprendizaje.
          </div>
        </div>
      </Container>
    </section>
  );
}
