import React from 'react';
import Image from "next/image";
export const AboutUs: React.FC = () => {
  return (
    <section className="px-4 md:px-8 max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Columna Izquierda: Contenido */}
        <div className="flex flex-col gap-6">
          <h2 className="font-heading text-4xl md:text-5xl text-brand-red">
            Sobre Nosotros
          </h2>
          <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-body">
            Es una iniciativa de formación accesible en habilidades digitales y uso de inteligencia artificial, orientada al desarrollo de ciudadanía digital.
          </p>
        </div>

        {/* Columna Derecha: Ilustración */}
        <div className="w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-lg relative border border-gray-100 dark:border-gray-700">
          <Image
          src="/assets/experienceimages/nosotros.jpeg"
          alt="Sobre Nosotros - Maestro Virtual"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          />
        </div>
      </div>
    </section>
  );
};
