"use client";
import Image from "next/image";
import React from 'react';
import { BookOpen, Users, Accessibility } from 'lucide-react';

interface AudienceCardProps {
  title: string;
  icon: React.ReactNode;
}

const AudienceCard: React.FC<AudienceCardProps> = ({ title, icon }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[200px] gap-4 border border-gray-100">
      <div className="text-blue-600">
        {icon}
      </div>
      <h3 className="font-heading text-2xl text-foreground">
        {title}
      </h3>
    </div>
  );
};

export const TargetAudience: React.FC = () => {
  const audiences = [
    {
      title: "Docentes de educación pública",
      icon: <BookOpen size={40} />
    },
    {
      title: "Adultos mayores",
      icon: <Users size={40} />
    },
    {
      title: "Personas con discapacidad",
      icon: <Accessibility size={40} />
    }
  ];

  const images = [
    "WhatsApp Image 2026-07-16 at 9.24.15 PM.jpeg",
    "WhatsApp Image 2026-07-16 at 9.24.16 PM (1).jpeg",
    "WhatsApp Image 2026-07-16 at 9.24.16 PM (2).jpeg",
    "WhatsApp Image 2026-07-16 at 9.24.19 PM (2).jpeg",
    "WhatsApp Image 2026-07-16 at 9.24.17 PM (1).jpeg",
    "WhatsApp Image 2026-07-16 at 9.24.19 PM.jpeg",
    "WhatsApp Image 2026-07-16 at 9.24.17 PM (3).jpeg",
    "WhatsApp Image 2026-07-16 at 9.24.15 PM.jpeg",
    "WhatsApp Image 2026-07-16 at 9.24.17 PM (5).jpeg",
    "WhatsApp Image 2026-07-16 at 9.24.17 PM (6).jpeg"
  ];

  // Duplicamos las imágenes para lograr el efecto infinito sin saltos
  const doubledImages = [...images, ...images];

  return (
    <section className="px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col gap-16 py-12">
      <div>
        <h2 className="font-heading text-4xl md:text-5xl text-brand-yellow mb-8 text-center">
          ¿A quién va dirigido?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <AudienceCard key={index} title={audience.title} icon={audience.icon} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-8">
          <h3 className="font-heading text-3xl md:text-4xl text-primary text-center ">
            Galería de Experiencias
          </h3>
        </div>

        {/* Carrusel continuo (Marquee) con CSS */}
        <div className=" relative left-1/2 w-screen -translate-x-1/2 overflow-hidden group">

          <style>{`
            @keyframes slow-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-slow-scroll {
              animation: slow-scroll 50s linear infinite;
            }
            .group:hover .animate-slow-scroll {
              animation-play-state: paused;
            }
          `}</style>

          <div className="flex w-max animate-slow-scroll">
            {doubledImages.map((image, index) => (
              <div
                key={index}
                className="w-[280px] md:w-[350px] shrink-0 px-3"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 h-full">
                  <Image
                  src={`/assets/experienceimages/${image}`}
                  alt={`Experiencia ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 280px, 350px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
