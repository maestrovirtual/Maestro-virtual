# Arquitectura del Proyecto

Proyecto: Maestro Virtual A.C.

Esta carpeta contiene la documentación oficial de la arquitectura del sistema.

La arquitectura aquí descrita representa el estado actual del proyecto y sirve como referencia para todos los integrantes del equipo.

---

# Objetivos de la Arquitectura

La arquitectura fue diseñada buscando:

- Escalabilidad.
- Modularidad.
- Separación de responsabilidades.
- Fácil mantenimiento.
- Desarrollo colaborativo.
- Compatibilidad con Next.js App Router.
- Preparación para crecimiento futuro.

---

# Arquitectura General

El proyecto utiliza una arquitectura **Monorepo Full Stack**.

Frontend y Backend viven dentro del mismo repositorio utilizando Next.js App Router.

```

Cliente
↓

Next.js App Router

↓

Route Handlers (API)

↓

Servicios

↓

Prisma ORM

↓

PostgreSQL

```

---

# Stack Tecnológico

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4

## Backend

- Next.js Route Handlers
- Prisma ORM
- PostgreSQL

## Autenticación

- Supabase Auth

## Correo

- Resend

## Testing

- Jest
- Playwright

## Deployment

- Vercel

---

# Organización del Proyecto

La estructura principal del repositorio es:

```

src/
app/
components/
features/
services/
lib/
data/
styles/
types/

```

Cada carpeta tiene una responsabilidad específica.

---

# Organización por Capas

La aplicación sigue una separación lógica por capas.

## App

Responsable del enrutamiento.

```

src/app

```

Contiene:

- páginas
- layouts
- Route Handlers
- internacionalización

---

## Features

Cada módulo funcional vive aislado.

Ejemplo:

```

features/
courses/
events/
contact/

```

Cada feature contiene sus propios componentes y lógica.

---

## Components

Componentes reutilizables.

Se dividen en:

```

components/
layout/
ui/
shared/

```

---

## Services

Contiene la lógica de comunicación con APIs o servicios externos.

Ejemplos:

```

services/mail
services/auth

```

---

## Lib

Contiene infraestructura compartida.

Ejemplos:

- Prisma
- Constantes
- Mail
- Fonts
- Utilidades

---

## Data

Datos estáticos del proyecto.

---

## Types

Interfaces y tipos globales.

---

# API

Las rutas del backend utilizan:

```

src/app/api/

```

Cada módulo posee su propio endpoint.

Ejemplo:

```

api/
users/
courses/
events/
contact/
mail/

```

---

# Base de Datos

La base de datos utiliza Prisma ORM.

El esquema vive en:

```

prisma/schema.prisma

```

Las migraciones se almacenan en:

```

prisma/migrations

```

---

# Internacionalización

El proyecto utiliza soporte para múltiples idiomas.

```

src/i18n/

```

Actualmente:

- Español
- Inglés

---

# Testing

El proyecto incorpora tres niveles de pruebas.

## Unitarias

```

__tests__/

```

Framework:

- Jest

---

## End-to-End

```

e2e-tests/

```

Framework:

- Playwright

---

## Build Validation

Cada Pull Request ejecuta automáticamente:

- Build
- ESLint
- Jest
- Playwright

mediante GitHub Actions.

---

# Integración Continua

El proyecto utiliza GitHub Actions para validar automáticamente el código antes de cada merge.

Los workflows se encuentran en:

```

.github/workflows/

```

---

# Variables de Entorno

Las variables sensibles se almacenan mediante:

```

.env
.env.local

```

El repositorio únicamente incluye:

```

.env.example

```

---

# Principios Arquitectónicos

La arquitectura sigue los siguientes principios:

- Modularidad
- Reutilización
- Separación de responsabilidades
- Componentización
- Escalabilidad
- Tipado fuerte mediante TypeScript
- Convención sobre configuración

---

# Evolución

Las decisiones arquitectónicas importantes no deben modificarse directamente.

Cada cambio relevante deberá documentarse mediante un ADR ubicado en:

```

docs/architecture/adr/

```

---

# Responsable

Arquitectura diseñada y mantenida por el equipo de desarrollo de Maestro Virtual A.C.

Responsable inicial:

Brandon Alejandro Pedraza Valdez

Agosto 2026