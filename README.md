# Maestro Virtual A.C. - Documentación Frontend

[![CI](https://github.com/Brandonschool349/Maestro-virtual/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/Brandonschool349/Maestro-virtual/actions/workflows/ci.yml)
[![Playwright](https://github.com/Brandonschool349/Maestro-virtual/actions/workflows/playwright.yml/badge.svg?branch=develop)](https://github.com/Brandonschool349/Maestro-virtual/actions/workflows/playwright.yml)

## Sobre el Proyecto

Landing page desarrollada para Maestro Virtual A.C., una iniciativa de formación accesible en habilidades digitales orientada al desarrollo de ciudadanía digital.

El proyecto busca reducir la brecha digital mediante una plataforma educativa accesible, conectando a las personas con herramientas y oportunidades de aprendizaje.

---

# Stack Tecnológico

- Framework principal: Next.js 16 (App Router)
- Lenguaje: TypeScript
- Librería UI: React 19
- Estilos: Tailwind CSS
- Animaciones: Framer Motion
- Iconos: Lucide React
- Gestión de código: Git + GitHub
- Deploy frontend: Vercel

---

# Arquitectura del Proyecto

El proyecto utiliza una arquitectura basada en componentes reutilizables para facilitar el mantenimiento y escalabilidad.

La estructura principal:

```
src/
├── app/
│   ├── page.tsx
│   ├── courses/
│   └── events/
│
├── components/
│   ├── layout/
│   ├── ui/
│   └── shared/
│
├── sections/
│   ├── home/
│   ├── courses/
│   ├── events/
│   └── contact/
│
├── data/
├── hooks/
├── lib/
└── types/
```

Cada sección de la aplicación se encuentra separada en módulos independientes para evitar componentes monolíticos y permitir el desarrollo paralelo entre integrantes del equipo.

---

# Estrategia de ramas Git

El proyecto utiliza un flujo Git Flow simplificado para organizar el trabajo del equipo.

La regla principal es:

Ningún integrante debe realizar commits directamente sobre main o develop.

Todo cambio debe entrar mediante Pull Request.

---

## Ramas principales

### main

Contiene la versión estable del proyecto lista para producción.

Los cambios llegan a esta rama únicamente después de la revisión y aprobación del equipo.

---

### develop

Es la rama de integración del proyecto.

Aquí se unen todas las funcionalidades terminadas antes de pasar a producción.

---

## Ramas de trabajo

Cada tarea de Jira debe tener su propia rama.

Formato:

```
feature/MV-XX-descripcion-corta
```

Ejemplo:

```
feature/MV-14-connect-courses-api
```

Para tareas de configuración, documentación o mantenimiento:

```
chore/MV-XX-descripcion-corta
```

Ejemplo:

```
chore/MV-03-document-git-workflow
```

---

# Flujo de trabajo Git

## 1. Actualizar develop

Antes de comenzar una nueva tarea:

```bash
git checkout develop
git pull origin develop
```

---

## 2. Crear rama de trabajo

Crear una rama relacionada con la tarea asignada en Jira:

```bash
git checkout -b feature/MV-XX-descripcion
```

Ejemplo:

```bash
git checkout -b feature/MV-14-connect-courses-api
```

---

## 3. Realizar cambios y commits

Los commits deben utilizar Conventional Commits.

Formato:

```
tipo(alcance): descripcion corta
```

Ejemplos:

```
feat(courses): connect courses API
```

```
fix(contact): fix email validation
```

```
chore(ci): update github actions workflow
```

---

## 4. Subir la rama

```bash
git push origin feature/MV-XX-descripcion
```

---

## 5. Crear Pull Request

Todo Pull Request debe dirigirse hacia:

```
develop
```

El Pull Request debe incluir:

- Número de tarea Jira relacionada.
- Descripción de los cambios realizados.
- Pasos para probar la funcionalidad.

---

# CI/CD

El proyecto utiliza GitHub Actions para validar automáticamente cada `push` y `pull_request`.

El pipeline principal (`ci.yml`) corre tres jobs en paralelo:

| Job | Comando | Propósito |
|-----|---------|-----------|
| **ESLint** | `npm run lint` | Reglas de estilo y calidad de código |
| **Unit Tests (Jest)** | `npm run test -- --ci --coverage` | Pruebas unitarias con reporte de cobertura |
| **Build Next.js** | `npm run build` | Verifica que el proyecto compile |

El reporte de cobertura de Jest se sube como artifact (`jest-coverage`) descargable desde la UI de GitHub Actions por 14 días.

Un pipeline aparte (`playwright.yml`) ejecuta las pruebas end-to-end con Playwright. Al terminar, sube el reporte HTML como artifact para analizar fallas.

Cuando cualquier check queda en rojo, el PR queda marcado como bloqueado (ver [MV-20 CI/CD](./docs/sprints/sprint-1/MV-20-ci-cd/README.md) para el detalle y cómo se activa el bloqueo de merge en `main` y `develop`).

---

# Entornos de despliegue

El proyecto utiliza Vercel para despliegues automáticos.

## Preview

Cada Pull Request genera un ambiente de prueba automático para revisar cambios antes de integrarlos.

---

## Staging

La rama:

```
develop
```

representa el ambiente de integración del equipo.

---

## Producción

La rama:

```
main
```

representa la versión publicada para usuarios finales.

---

# Gestión del proyecto

El seguimiento del desarrollo se realiza mediante Jira.

Cada tarea tiene asignado un identificador único:

Ejemplo:

```
MV-14
```

Este identificador debe aparecer en:

- Nombre de ramas.
- Pull Requests.
- Commits relacionados.

Esto permite rastrear fácilmente los cambios realizados durante el desarrollo.

---

# Instalación local

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

Entrar al proyecto:

```bash
cd maestro-virtual
```

Instalar dependencias:

```bash
npm install
```

Ejecutar ambiente local:

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:3000
```

---

# Comandos principales

Ejecutar servidor de desarrollo:

```bash
npm run dev
```

Construir proyecto:

```bash
npm run build
```

Ejecutar lint:

```bash
npm run lint
```

Ejecutar pruebas:

```bash
npm test
```

---

# Equipo de desarrollo

Proyecto desarrollado para Maestro Virtual A.C.

Integrantes:

- JP - Frontend
- Eduardo - Backend
- Brandon - DevOps / CI/CD
- Leo - QA