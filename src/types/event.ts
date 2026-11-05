export type EventCategory =
  | 'zoom'
  | 'excel'
  | 'powerpoint'
  | 'canva'
  | 'classroom'
  | 'emprendimiento'
  | 'alfabetizacion';

export type EventModality = 'presencial' | 'online';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  profile: string; // Perfil del participante
  objective: string; // Objetivo / Descripción del curso
  duration: string; // ej. '10 sesiones – 2 horas cada sesión'
  participants: string; // ej. '10 – 15 por capacitador'
  date: string; // formato ISO: 'YYYY-MM-DD'
  time: string; // ej. '10:00 - 12:00 hrs'
  modality: EventModality;
  location?: string; // solo si es presencial
  address?: string; // solo si es presencial
  platform?: string; // solo si es online
  requirements?: string; // Requerido para el participante
  image?: string; // URL de la portada o afiche del evento
  description?: string; // Descripción detallada del evento
  sponsorsImageUrl?: string; // URL opcional de la imagen de patrocinadores/aliados
}