import React from 'react';

export const Impact: React.FC = () => {
  return (
    <section className="w-full bg-primary py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
        <h2 className="font-heading text-3xl md:text-4xl text-white/90">
          Nuestro Impacto
        </h2>
        <p className="font-body text-xl md:text-3xl text-white leading-relaxed font-medium">
          &quot;Cuando una persona aprende, transforma su vida, comparte el conocimiento con otros y transforma su comunidad.&quot;
        </p>
      </div>
    </section>
  );
};
