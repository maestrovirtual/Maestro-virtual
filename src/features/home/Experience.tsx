"use client";

import React, { useState } from 'react';

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
}

const TestimonialCard: React.FC<TestimonialProps> = ({ name, role, content }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full gap-4">
      <p className="font-body text-gray-600 dark:text-gray-300 text-left italic">
        &quot;{content}&quot;
      </p>
      <div className="mt-auto pt-4 text-center">
        <span className="font-heading text-white text-lg block">{name}</span>
        <span className="font-body text-sm text-blue-600 dark:text-blue-400 font-medium">{role}</span>
      </div>
    </div>
  );
};

export const Experience: React.FC = () => {
  const testimonials = [
    {
      name: "María Fernández",
      role: "Docente de Primaria",
      content: "Gracias a Maestro Virtual, ahora puedo organizar mis clases en Classroom y hacer presentaciones interactivas en Canva. La dinámica con mis alumnos ha mejorado muchísimo."
    },
    {
      name: "Carlos Gómez",
      role: "Participante Adulto Mayor",
      content: "Antes me daba miedo picarle a la computadora. Con los talleres aprendí a usar WhatsApp para hablar con mis nietos y a navegar por internet de forma segura sin temor a descomponer algo."
    },
    {
      name: "Laura Martínez",
      role: "Coordinadora de Inclusión",
      content: "Ver cómo las personas con discapacidad logran utilizar herramientas tecnológicas para emprender y ser autónomas es la mayor satisfacción. La tecnología realmente nos iguala."
    }
  ];

  const videos = [
    "WhatsApp Video 2026-07-16 at 9.24.18 PM (1).mp4",
    "WhatsApp Video 2026-07-16 at 9.24.18 PM.mp4",
    "WhatsApp Video 2026-07-16 at 9.24.19 PM.mp4",
    "WhatsApp Video 2026-07-16 at 9.24.20 PM (1).mp4",
    "WhatsApp Video 2026-07-16 at 9.24.20 PM (2).mp4",
    "WhatsApp Video 2026-07-16 at 9.24.20 PM (3).mp4",
    "WhatsApp Video 2026-07-16 at 9.24.20 PM.mp4",
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(videos.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Divide videos into pages of 3
  const pages = Array.from({ length: totalPages }, (_, i) => 
    videos.slice(i * itemsPerPage, i * itemsPerPage + itemsPerPage)
  );

  return (
    <section className="px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col gap-16 py-12">
      <div>
        <h2 className="font-heading text-4xl md:text-5xl text-brand-green mb-8">
          Experiencias y Responsables
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h3 className="font-heading text-3xl md:text-4xl text-brand-green text-center md:text-left">
            Nuestra labor en acción
          </h3>
          <div className="flex gap-4">
            <button 
              onClick={handlePrev} 
              disabled={currentPage === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 font-bold"
              aria-label="Anteriores videos"
            >
              &larr;
            </button>
            <button 
              onClick={handleNext} 
              disabled={currentPage === totalPages - 1}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 font-bold"
              aria-label="Siguientes videos"
            >
              &rarr;
            </button>
          </div>
        </div>
        
        {/* Animated container for videos */}
        <div className="overflow-hidden w-full">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {pages.map((pageVideos, pageIndex) => (
              <div key={pageIndex} className="w-full shrink-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {pageVideos.map((video, index) => (
                    <div key={index} className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 aspect-[9/16] bg-black">
                      <video 
                        src={`/assets/videos/${video}`} 
                        controls 
                        className="w-full h-full object-cover"
                        preload="metadata"
                      >
                        Tu navegador no soporta la etiqueta de video.
                      </video>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

