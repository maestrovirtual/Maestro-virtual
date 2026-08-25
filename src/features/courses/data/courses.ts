export type CourseStage = 1 | 2 | 3;

export type CourseType = "Curso" | "Taller" | "Conferencia";

export interface CourseTestimonial {
  name: string;
  role: string;
  message: string;
  avatar?: string;
  rating?: number;
}

export interface Course {
  id: string;
  slug: string;

    testimonials?: CourseTestimonial[];

  title: string;
  shortDescription: string;
  description: string;

  stage: CourseStage;
  categories: string[];
  type: CourseType;

  featured: boolean;
  featuredOrder?: number;
  backgroundPattern:
  | "grid"
  | "waves"
  | "shapes"
  | "cards"
  | "slides"
  | "growth"
  | "chat";

  clickable: boolean;
  

  duration: string;
  sessions?: number;
  hoursPerSession?: number;

  modality: string;
  participants: string;

  targetAudience: string;
  objective: string;
  requirements: string;

  skills: string[];

  image?: string;
  icon?: string;
  video?: string;

  color: string;
}

export const courses: Course[] = [
  {
    id: "zoom",
    slug: "zoom",

    title: "Zoom",

        testimonials:[
    {
      name:"María González",
      role:"Docente de primaria",
      message:
        "El curso me ayudó a organizar mejor la información de mis alumnos y crear herramientas más eficientes para mi trabajo.",
        rating:5
    },

    {
      name:"Carlos Ramírez",
      role:"Coordinador académico",
      message:
        "Aprendimos a utilizar Excel de una manera práctica y enfocada a nuestras necesidades educativas.",
        rating:5
    },

    {
      name:"Ana López",
      role:"Docente secundaria",
      message:
        "Ahora puedo crear hojas de cálculo que facilitan mucho mi organización diaria.",
        rating:4
    },
  ],

    shortDescription:
      "Aprende a utilizar Zoom para impartir clases, reuniones y videoconferencias de forma profesional.",

    description:
      "Curso enfocado en el uso de la plataforma Zoom y herramientas digitales complementarias para mejorar la comunicación y la enseñanza.",

    stage: 1,

    categories: ["Videoconferencias"],

    type: "Curso",

    featured: true,

    featuredOrder: 3,

    backgroundPattern: "waves",

    clickable: true,

    duration: "10 sesiones",

    sessions: 10,

    hoursPerSession: 2,

    modality: "Presencial u Online",

    participants: "10 - 15 participantes",

    targetAudience:
      "Docentes y personal administrativo de escuelas públicas.",

    objective:
      "Desarrollar habilidades para utilizar Zoom de manera eficiente en clases y reuniones digitales.",

    requirements:
      "Computadora con internet, libreta y pluma.",

    skills: [
      "Escucha activa",
      "Participación activa",
      "Toma de notas"
    ],

    image: "/images/courses/zoom.jpg",
    icon: "/icons/zoom.webp",

    video: "",

    color: "#72d3ff"
  },

  {
    id: "excel",
    slug: "excel",

    title: "Microsoft Excel",

    testimonials:[
    {
      name:"María González",
      role:"Docente de primaria",
      message:
        "El curso me ayudó a organizar mejor la información de mis alumnos y crear herramientas más eficientes para mi trabajo.",
        rating:5
    },

    {
      name:"Carlos Ramírez",
      role:"Coordinador académico",
      message:
        "Aprendimos a utilizar Excel de una manera práctica y enfocada a nuestras necesidades educativas.",
        rating:5
    },

    {
      name:"Ana López",
      role:"Docente secundaria",
      message:
        "Ahora puedo crear hojas de cálculo que facilitan mucho mi organización diaria.",
        rating:4
    },
  ],

    shortDescription:
      "Aprende a organizar información y crear hojas de cálculo para facilitar el trabajo docente.",

    description:
      "Curso práctico para dominar las funciones principales de Microsoft Excel y desarrollar plantillas útiles para el aula.",

    stage: 1,

    categories: ["Productividad"],

    type: "Curso",

    featured: true,

    featuredOrder: 2,

    backgroundPattern: "grid",

    clickable: true,

    duration: "5 sesiones",

    sessions: 5,

    hoursPerSession: 2,

    modality: "Presencial u Online",

    participants: "10 - 15 participantes",

    targetAudience:
      "Docentes y personal administrativo de escuelas públicas.",

    objective:
      "Aprender el manejo de Microsoft Excel para organizar y procesar información académica.",

    requirements:
      "Computadora con Microsoft Excel instalado, libreta y pluma.",

    skills: [
      "Escucha activa",
      "Participación activa",
      "Toma de notas"
    ],

    image: "/images/courses/excel.jpg",
    icon: "/icons/excel.webp",

    video: "",

    color: "#00BF63"
  },

  {
    id: "powerpoint",
    slug: "powerpoint",

    title: "Microsoft PowerPoint",

        testimonials:[
    {
      name:"María González",
      role:"Docente de primaria",
      message:
        "El curso me ayudó a organizar mejor la información de mis alumnos y crear herramientas más eficientes para mi trabajo.",
        rating:5
    },

    {
      name:"Carlos Ramírez",
      role:"Coordinador académico",
      message:
        "Aprendimos a utilizar Excel de una manera práctica y enfocada a nuestras necesidades educativas.",
        rating:5
    },

    {
      name:"Ana López",
      role:"Docente secundaria",
      message:
        "Ahora puedo crear hojas de cálculo que facilitan mucho mi organización diaria.",
        rating:4
    },
  ],

    shortDescription:
      "Diseña presentaciones claras y atractivas para apoyar tus clases y exposiciones.",

    description:
      "Aprende a utilizar PowerPoint para crear material visual profesional y mejorar la comunicación en el aula.",

    stage: 1,

    categories: ["Presentaciones"],

    type: "Curso",

    featured: true,

    featuredOrder: 4,

    backgroundPattern: "slides",

    clickable: true,

    duration: "5 sesiones",

    sessions: 5,

    hoursPerSession: 2,

    modality: "Presencial u Online",

    participants: "10 - 15 participantes",

    targetAudience:
      "Docentes y personal administrativo de escuelas públicas.",

    objective:
      "Crear presentaciones didácticas utilizando las herramientas principales de PowerPoint.",

    requirements:
      "Computadora con Microsoft PowerPoint instalado e internet deseable.",

    skills: [
      "Escucha activa",
      "Participación activa",
      "Toma de notas"
    ],

    image: "/images/courses/powerpoint.jpg",

    icon: "/icons/powerpoint.webp",

    video: "",

    color: "#F97316"
  },

  {
    id: "canva",
    slug: "canva",

    title: "Canva",

        testimonials:[
    {
      name:"María González",
      role:"Docente de primaria",
      message:
        "El curso me ayudó a organizar mejor la información de mis alumnos y crear herramientas más eficientes para mi trabajo.",
        rating:5
    },

    {
      name:"Carlos Ramírez",
      role:"Coordinador académico",
      message:
        "Aprendimos a utilizar Excel de una manera práctica y enfocada a nuestras necesidades educativas.",
        rating:5
    },

    {
      name:"Ana López",
      role:"Docente secundaria",
      message:
        "Ahora puedo crear hojas de cálculo que facilitan mucho mi organización diaria.",
        rating:4
    },
  ],

    shortDescription:
      "Crea material visual moderno para clases, presentaciones y comunicación institucional.",

    description:
      "Aprende a utilizar Canva para diseñar contenido visual atractivo de forma sencilla.",

    stage: 1,

    categories: ["Diseño", "Presentaciones"],

    type: "Curso",

    featured: true,

    featuredOrder: 5,

    backgroundPattern: "shapes",

    clickable: true,

    duration: "5 sesiones",

    sessions: 5,

    hoursPerSession: 2,

    modality: "Presencial u Online",

    participants: "10 - 15 participantes",

    targetAudience:
      "Docentes y personal administrativo de escuelas públicas.",

    objective:
      "Diseñar recursos visuales y material didáctico utilizando Canva.",

    requirements:
      "Computadora con navegador web, internet, libreta y pluma.",

    skills: [
      "Escucha activa",
      "Participación activa",
      "Toma de notas"
    ],

    image: "/images/courses/canva.jpg",
    icon: "/icons/canva.png",

    video: "",

    color: "#7a4aff"
  },

  {
    id: "google-classroom",
    slug: "google-classroom",

    title: "Google Classroom",

        testimonials:[
    {
      name:"María González",
      role:"Docente de primaria",
      message:
        "El curso me ayudó a organizar mejor la información de mis alumnos y crear herramientas más eficientes para mi trabajo.",
        rating:5
    },

    {
      name:"Carlos Ramírez",
      role:"Coordinador académico",
      message:
        "Aprendimos a utilizar Excel de una manera práctica y enfocada a nuestras necesidades educativas.",
        rating:5
    },

    {
      name:"Ana López",
      role:"Docente secundaria",
      message:
        "Ahora puedo crear hojas de cálculo que facilitan mucho mi organización diaria.",
        rating:4
    },
  ],

    shortDescription:
      "Organiza clases, tareas y recursos utilizando Google Classroom y Google for Education.",

    description:
      "Aprende a administrar clases virtuales y optimizar la enseñanza mediante el ecosistema de Google.",

    stage: 1,

    categories: ["Google Workspace"],

    type: "Curso",

    featured: true,

    featuredOrder: 6,

    backgroundPattern: "cards",

    clickable: true,

    duration: "10 sesiones",

    sessions: 10,

    hoursPerSession: 2,

    modality: "Presencial u Online",

    participants: "10 - 15 participantes",

    targetAudience:
      "Docentes e instructores que desean mejorar la organización y dinámica de sus clases.",

    objective:
      "Dominar Google Classroom y las principales herramientas de Google for Education.",

    requirements:
      "Computadora con navegador web, internet, libreta y pluma.",

    skills: [
      "Escucha activa",
      "Participación activa",
      "Toma de notas"
    ],

    image: "/images/courses/google-classroom.jpg",
    icon: "/icons/classroom.webp",

    video: "",

    color: "#ffd04f"
  },

  {
  id: "herramientas-digitales-emprendimiento",
  slug: "herramientas-digitales-emprendimiento",

  title: "Emprendimiento y autoempleo",

  shortDescription:
    "Desarrolla competencias digitales para utilizar plataformas tecnológicas enfocadas al emprendimiento y generación de ingresos.",

  description:
    "Taller orientado al desarrollo de habilidades tecnológicas básicas y uso de plataformas digitales que permitan fortalecer la autonomía económica e inclusión laboral de personas con discapacidad.",

  stage: 2,

  categories: ["Emprendimiento"],

  type: "Taller",

  featured: false,

  backgroundPattern: "growth",

  clickable: true,


  duration: "5 módulos",

  sessions: 5,

  hoursPerSession: 2,


  modality: "Presencial u Online",

  participants: "30 personas por grupo aprox.",


  targetAudience:
    "Personas mayores de edad con discapacidades interesadas en el emprendimiento y autoempleo.",


  objective:
    "Fortalecer competencias digitales para utilizar herramientas tecnológicas que permitan desarrollar oportunidades de emprendimiento y generación de ingresos.",


  requirements:
    "Preferentemente proyector y micrófono.",


  skills:[
    "Uso básico de herramientas digitales",
    "Manejo de plataformas tecnológicas",
    "Autonomía digital",
    "Emprendimiento"
  ],


  image:
    "/images/courses/emprendimiento-digital.jpg",

  icon:
    "/icons/emprendimiento.webp",


  video:"",


  color:"#334155",
},


{
  id:"aprendiendo-tecnologias",

  slug:"aprendiendo-tecnologias",


  title:"Aprendiendo a usar las tecnologías",


  shortDescription:
    "Curso diseñado para aprender herramientas tecnológicas básicas y mejorar la comunicación digital.",


  description:
    "Curso enfocado en alfabetización tecnológica básica, uso de dispositivos móviles, navegación segura en internet y comunicación digital mediante herramientas como WhatsApp para favorecer la autonomía e integración social.",


  stage:2,


  categories: ["Inclusión digital"],


  type:"Curso",


  featured:true,

  featuredOrder: 1,


  backgroundPattern:"chat",


  clickable:true,


  duration:"1 curso",

  sessions:1,

  hoursPerSession:2,


  modality:
    "Presencial u Online",


  participants:
    "30 personas por grupo aprox.",



  targetAudience:
    "Adultos mayores con dificultad en el uso de herramientas tecnológicas actuales que desean aprender a utilizarlas.",



  objective:
    "Desarrollar habilidades digitales básicas para utilizar dispositivos móviles, navegar de manera segura y comunicarse mediante herramientas tecnológicas.",



  requirements:
    "Preferentemente proyector y micrófono.",



  skills:[
    "Uso de dispositivos móviles",
    "Comunicación digital",
    "Seguridad en internet",
    "Herramientas tecnológicas básicas"
  ],


  image:
    "/images/courses/aprendiendo-tecnologias.jpg",


  icon:
    "/icons/whatsapp.webp",


  video:"",


  color:"#50f5a5",
}, 

{
id:"tramites-digitales",

slug:"tramites-digitales",

title:"Orientación para Trámites Digitales",

shortDescription:
"Aprende a utilizar plataformas gubernamentales, banca electrónica y servicios públicos digitales.",


description:
"Taller orientado a capacitar a los beneficiarios en el uso de plataformas digitales gubernamentales, servicios públicos y herramientas electrónicas, promoviendo el acceso efectivo a derechos y servicios digitales.",


stage:3,

categories: ["Inclusión digital"],

type:"Taller",

featured:false,

backgroundPattern:"cards",

clickable:false,


duration:"Próximamente",

sessions:undefined,

hoursPerSession:undefined,


modality:"Por definir",

participants:"Próximamente",


targetAudience:
"Personas interesadas en aprender a utilizar servicios digitales públicos y financieros.",


objective:
"Fortalecer el acceso a servicios digitales mediante herramientas gubernamentales y plataformas electrónicas.",


requirements:
"Por definir.",


skills:[
"Servicios digitales",
"Gestión en línea",
"Uso de plataformas digitales"
],


image:"/images/courses/tramites-digitales.jpg",
icon:"",

video:"",

color:"#6366F1"
},



{
id:"tecnologias-apoyo-discapacidad",

slug:"tecnologias-apoyo-discapacidad",

title:"Inclusión Digital y Tecnologías de Apoyo para Personas con Discapacidad",

shortDescription:
"Conoce herramientas de accesibilidad y tecnologías adaptadas para mejorar la autonomía digital.",


description:
"Taller enfocado en el uso de herramientas de accesibilidad, aplicaciones adaptadas y tecnologías de apoyo que faciliten la comunicación, autonomía y participación social.",


stage:3,

categories: ["Accesibilidad"],

type:"Taller",

featured:false,

backgroundPattern:"shapes",

clickable:false,


duration:"Próximamente",

modality:"Por definir",

participants:"Próximamente",


targetAudience:
"Personas con discapacidad interesadas en herramientas digitales de apoyo.",


objective:
"Promover el uso de tecnologías accesibles para mejorar la autonomía e inclusión digital.",


requirements:
"Por definir.",


skills:[
"Accesibilidad digital",
"Tecnologías de apoyo",
"Comunicación digital"
],


image:"/images/courses/tecnologias-apoyo-discapacidad.jpg",
icon:"",

video:"",

color:"#8B5CF6"
},



{
id:"seguridad-linea",

slug:"seguridad-linea",

title:"Seguridad en Línea y Protección de Datos Personales",

shortDescription:
"Aprende prácticas seguras para proteger tu información y navegar en internet.",


description:
"Taller enfocado en prevención de fraudes digitales, riesgos en internet y protección de información personal para fortalecer hábitos seguros en tecnología.",


stage:3,

categories: ["Ciberseguridad"],

type:"Taller",

featured:false,

backgroundPattern:"grid",

clickable:false,


duration:"Próximamente",

modality:"Por definir",

participants:"Próximamente",


targetAudience:
"Personas interesadas en aprender seguridad digital básica.",


objective:
"Desarrollar hábitos seguros para proteger información personal y prevenir riesgos digitales.",


requirements:
"Por definir.",


skills:[
"Seguridad digital",
"Protección de datos",
"Navegación segura"
],


image:"/images/courses/seguridad-linea.jpg",
icon:"",

video:"",

color:"#EF4444"
}
];

