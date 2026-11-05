import { EventItem } from '@/types/event';

export const events: EventItem[] = [
  // ETAPA 1 — Herramientas digitales académicas y administrativas
  {
    id: 'evt-001',
    title: 'Zoom: Videoconferencias para el aula',
    category: 'zoom',
    profile:
      'Docentes y personal administrativo en escuelas públicas cuya necesidad sea estar frente a un grupo y exponer sobre un tema por medios digitales.',
    objective:
      'Desarrollar habilidades para el uso y manejo de la plataforma Zoom, además de descubrir otras herramientas digitales que mejoren la dinámica con la tecnología.',
    description:
      'Taller práctico enfocado en dominar las funciones esenciales y avanzadas de Zoom para entornos educativos:\n\n• Configuración de sesiones seguras y control de accesos.\n• Creación y moderación de salas de grupos pequeños (breakout rooms).\n• Integración de dinámicas interactivas mediante encuestas y pizarra digital.\n• Recomendaciones pedagógicas para fomentar la participación activa del alumnado.',
    duration: '10 sesiones – 2 horas cada sesión',
    participants: '10 – 15 por capacitador',
    date: '2026-08-05',
    time: '17:00 - 19:00 hrs',
    modality: 'online',
    platform: 'Zoom',
    requirements: 'Acceso a una computadora con internet, libreta y pluma.',
    image: 'https://placeholder.com/600x400',
  },
  {
    id: 'evt-002',
    title: 'Excel: Organización y manejo de datos',
    category: 'excel',
    profile:
      'Docentes y personal administrativo cuya necesidad sea concentrar información y crear archivos para facilitar el procesamiento de datos en su labor docente.',
    objective:
      'Desarrollar habilidades para el uso de Microsoft Excel y crear una plantilla para el concentrado de listas de asistencia en el aula.',
    description:
      'Capacitación integral para dominar las herramientas de cálculo y organización de datos en el ámbito académico:\n\n• Formato de celdas, filtros avanzados y validación de datos.\n• Aplicación de fórmulas clave: BUSCARV, SUMAR.SI, PROMEDIO y SI condicional.\n• Diseño de plantillas automatizadas para control de calificaciones y asistencia.\n• Elaboración de gráficos representativos para informes escolares.',
    duration: '5 sesiones – 2 horas cada sesión',
    participants: '10 – 15 por capacitador',
    date: '2026-08-12',
    time: '10:00 - 12:00 hrs',
    modality: 'presencial',
    location: 'Tec de Monterrey',
    address: 'Campus Monterrey, Sala de cómputo B',
    requirements: 'Computadora con Microsoft Excel, libreta y pluma.',
  },
  {
    id: 'evt-003',
    title: 'PowerPoint: Apoyo visual para clases',
    category: 'powerpoint',
    profile:
      'Docentes y personal administrativo cuya necesidad sea preparar información como apoyo pedagógico-visual para sesiones de trabajo y clases frente a grupo.',
    objective:
      'Desarrollar habilidades para el uso de Microsoft PowerPoint y crear una plantilla de presentación para el aula.',
    duration: '5 sesiones – 2 horas cada sesión',
    participants: '10 – 15 por capacitador',
    date: '2026-08-19',
    time: '16:00 - 18:00 hrs',
    modality: 'presencial',
    location: 'UANL',
    address: 'Facultad de Ciencias de la Comunicación, Aula 4',
    requirements: 'Computadora con Microsoft PowerPoint, libreta, pluma e internet (deseable).',
  },
  {
    id: 'evt-004',
    title: 'Canva: Diseño de material didáctico',
    category: 'canva',
    profile:
      'Docentes y personal administrativo cuyo objetivo sea mejorar el aspecto visual del trabajo y la distribución de información, así como crear material didáctico.',
    objective:
      'Desarrollar habilidades para el uso de Canva en la creación de material visual para clases o distribución de información a la comunidad escolar.',
    duration: '5 sesiones – 2 horas cada sesión',
    participants: '10 – 15 por capacitador',
    date: '2026-08-26',
    time: '18:00 - 19:30 hrs',
    modality: 'online',
    platform: 'Google Meet',
    requirements: 'Computadora con buscador web e internet, libreta y pluma.',
  },
  {
    id: 'evt-005',
    title: 'Google Classroom para instituciones',
    category: 'classroom',
    profile:
      'Instructores y personal administrativo cuyo objetivo sea mejorar la dinámica de trabajo y organización de la información, así como la relación en los procesos de enseñanza-aprendizaje.',
    objective:
      'Desarrollar habilidades para el uso de la plataforma Classroom junto con las herramientas de Google for Education.',
    duration: '10 sesiones – 2 horas cada sesión',
    participants: '10 – 15 por grupo',
    date: '2026-09-02',
    time: '10:00 - 12:00 hrs',
    modality: 'presencial',
    location: 'Tec de Monterrey',
    address: 'Campus Monterrey, Sala de cómputo B',
    requirements: 'Computadora con buscador web e internet, libreta y pluma.',
  },

  // ETAPA 2 — Cursos de inclusión
  {
    id: 'evt-006',
    title: 'Herramientas digitales para el emprendimiento y autoempleo',
    category: 'emprendimiento',
    profile: 'Personas mayores de edad con discapacidades interesadas en el emprendimiento y autoempleo.',
    objective:
      'Desarrollo de competencias tecnológicas básicas y uso de plataformas digitales para la generación de ingresos, fortaleciendo la autonomía económica y la inclusión laboral.',
    duration: '5 módulos – 2 horas por módulo aprox.',
    participants: '30 personas por grupo aprox.',
    date: '2026-09-09',
    time: '11:00 - 13:00 hrs',
    modality: 'presencial',
    location: 'UANL',
    address: 'Ciudad Universitaria, Centro de Cómputo',
    requirements: 'Proyector y micrófono.',
  },
  {
    id: 'evt-007',
    title: 'Aprendiendo a usar las tecnologías (WhatsApp)',
    category: 'alfabetizacion',
    profile:
      'Adultos mayores a quienes se les dificulta el uso de herramientas tecnológicas actuales (específicamente WhatsApp) y desean aprender a usarlas.',
    objective:
      'Alfabetización tecnológica básica: uso de dispositivos móviles, navegación segura en internet y comunicación digital para favorecer su autonomía e integración social.',
    duration: '2 horas por curso aprox.',
    participants: '30 personas por grupo aprox.',
    date: '2026-09-16',
    time: '17:00 - 19:00 hrs',
    modality: 'presencial',
    location: 'Tec de Monterrey',
    address: 'Campus Monterrey, Centro Comunitario',
    requirements: 'Proyector y micrófono.',
  },
];