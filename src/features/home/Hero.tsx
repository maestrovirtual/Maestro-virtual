import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 md:px-8 max-w-4xl mx-auto min-h-[60vh]">

      {/* Título de gran impacto con la fuente 'Hit and Run' */}
      <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-6 text-primary">
        Educación Digital con Enfoque Social
      </h1>

      {/* Párrafo descriptivo con la fuente 'Josephin' */}
      <p className="text-lg md:text-xl text-slate-700 max-w-2xl mb-10 font-body">
        Cerramos la brecha digital impulsando la inclusión real y conectando personas con oportunidades.
      </p>

      {/* Call to Action */}
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-body text-xl font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
        Únete Hoy
      </button>

    </section>
  );
};
