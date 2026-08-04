# MV-11: Definición del Stack de Backend y Arquitectura de Datos
**Responsable:** Eduardo Martinez Soto (Equipo de TI - Maestro Virtual A.C.)  
**Fecha de decisión:** Julio 2026  
**Épica:** Arquitectura backend + base de datos  

---

## 1. Resumen Ejecutivo y Decisión Técnica
Tras evaluar las necesidades del proyecto para **Maestro Virtual A.C.** y considerar la infraestructura actual del equipo, se ha optado por una arquitectura **Monorepo Full-Stack** utilizando los **Route Handlers de Next.js (`app/api/`)** junto con **PostgreSQL** como base de datos relacional y **Prisma ORM** para el modelado de datos.

### Tecnologías Seleccionadas:
* **Backend / API:** Next.js Route Handlers + Server Actions (en el mismo repositorio)
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma ORM
* **Autenticación:** Supabase Auth
* **Mailing / Envío de correos:** Resend / SendGrid
* **Testing de Backend:** Jest + Supertest

---

## 2. Alternativas Evaluadas vs. Opción Seleccionada
Durante el análisis se compararon tres caminos arquitectónicos principales:

| Criterio / Opción | 1. Node.js + Express (Backend separado) | 2. Supabase BaaS (Gestionado total) | **3. Next.js Route Handlers + Prisma (SELECCIONADO)** |

| **Arquitectura** | Dos repositorios distintos (Frontend / Backend) | Dependencia de servicios externos (BaaS) | **Monorepo unificado (`src/app/api/`)** |
| **Compatibilidad** | Requiere configurar CORS y sincronizar tipos manualmente. | Excelente, pero menor control lógico a medida. | **100% Nativo con Next.js 16 + React 19 + TypeScript** |
| **Velocidad de desarrollo** | Lenta (mantenimiento de dos pipelines CI/CD separados) | Muy alta al inicio, limitada en lógicas complejas | **Alta (compartimos tipos de TS directamente entre Front y Back)** |
| **Costo de hosting** | Requiere dos servidores pagados o administrados | Tier gratuito sujeto a límites de plataforma | **Costo optimizado (1 solo despliegue en Vercel + BD gestionada)** |

---

## 3. Justificación Técnica y Operativa

### A. Compatibilidad con el Frontend (Next.js 16 + TypeScript)
El equipo de frontend ya desarrolló la base web en **Next.js 16.2 (App Router) con React 19 y TypeScript**. Mantener el backend dentro del mismo proyecto mediante `src/app/api/` elimina problemas de CORS y nos permite compartir las interfaces y tipos de TypeScript de forma directa entre la interfaz web y la base de datos.

### B. Curva de Aprendizaje y Mantenibilidad
Nuesytro equipo es pequeño (4 desarrolladores) y trabaja a tiempo parcial. Administrar un monorepo nos ahorra la sobrecarga de mantener dos flujos de Git y dos pipelines de CI/CD distintos. Cualquier desarrollador puede correr toda la aplicación en local con un solo comando (`npm run dev`).

### C. Velocidad de Desarrollo y Control
A diferencia de un Backend-as-a-Service puro donde se pierde control del servidor, usar **Prisma ORM con PostgreSQL** nos otorga un control total sobre las migraciones de base de datos, relaciones complejas (como las inscripciones a cursos/eventos) y tipado estricto, sin perder velocidad.

### D. Costo de Hosting y Simplicidad de Infraestructura
La aplicación web ya cuenta con los DNS apuntando al entorno de **Vercel** conectado a nuestro repositorio. Al usar los Route Handlers, Vercel se encarga de desplegar la API sin costo de servidor independiente, conectándose únicamente a una base de datos PostgreSQL gestionada (Neon o Supabase DB).