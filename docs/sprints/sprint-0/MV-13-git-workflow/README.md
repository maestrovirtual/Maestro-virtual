# MV-13: Git Workflow y Configuración Inicial de CI/CD

**Responsable:** Brandon Alejandro Pedraza Valdez (Equipo de TI - Maestro Virtual A.C.)  
**Fecha de implementación:** Agosto 2026  
**Sprint:** Sprint 0  
**Épica:** Infraestructura de Desarrollo

---

# 1. Objetivo

Definir un flujo de trabajo estandarizado para el desarrollo colaborativo del proyecto Maestro Virtual, implementando una estrategia de ramas basada en Git Flow e integrando una canalización básica de Integración Continua (CI) mediante GitHub Actions.

El objetivo principal es garantizar que cada cambio realizado por cualquier integrante del equipo sea validado automáticamente antes de integrarse a la rama principal del proyecto.

---

# 2. Alcance

Durante esta tarea se implementó:

- Estructura inicial de ramas del proyecto.
- Flujo de Pull Requests.
- Integración con GitHub Actions.
- Validaciones automáticas.
- Integración con Vercel para Preview Deployments.
- Configuración inicial de variables de entorno para CI/CD.

---

# 3. Estrategia de Ramas

Se adoptó una estrategia basada en Git Flow simplificado.

## Ramas principales

| Rama | Propósito |
|-------|-----------|
| main | Producción |
| develop | Integración del desarrollo |
| feature/* | Desarrollo de nuevas funcionalidades |
| hotfix/* | Correcciones urgentes |
| release/* | Preparación de versiones |

Cada desarrollador trabaja únicamente sobre ramas `feature/*`.

Ejemplo:

```

feature/MV-19-mail-service

```

---

# 4. Flujo de Trabajo

El flujo definido para el equipo es:

```

feature/*
↓
Push
↓
Pull Request
↓
GitHub Actions
↓
Revisión de Código
↓
Merge
↓
develop
↓
Release
↓
main

```

Ningún cambio llega directamente a `main`.

Todo cambio debe pasar por revisión mediante Pull Request.

---

# 5. Integración Continua (CI)

Se configuró GitHub Actions para ejecutar automáticamente diferentes validaciones del proyecto.

Los workflows implementados fueron:

| Workflow | Función |
|----------|----------|
| build.yml | Compila la aplicación con Next.js |
| lint.yml | Ejecuta ESLint |
| test.yml | Ejecuta pruebas unitarias con Jest |
| playwright.yml | Ejecuta pruebas End-to-End |

Cada workflow se ejecuta automáticamente cuando ocurre un:

- Push
- Pull Request

sobre las ramas configuradas del proyecto.

---

# 6. Validaciones Automáticas

Antes de aceptar un Pull Request se verifican automáticamente:

- Compilación correcta del proyecto.
- Errores de TypeScript.
- Reglas de ESLint.
- Pruebas unitarias.
- Pruebas End-to-End.

Si alguna validación falla, el Pull Request no debe aprobarse hasta corregir el problema.

---

# 7. Integración con Vercel

Se conectó el repositorio con Vercel para realizar despliegues automáticos.

Se configuraron:

- Preview Deployments para Pull Requests.
- Production Deployment para la rama principal.
- Variables de entorno necesarias para la compilación.

Durante esta implementación se identificó que Vercel requiere configurar las variables de entorno utilizadas por servicios externos (por ejemplo Resend) para permitir que el proceso de build finalice correctamente.

---

# 8. Variables de Entorno

Se estableció el uso de:

- `.env`
- `.env.local`
- `.env.example`

Las variables sensibles no forman parte del repositorio.

Cada desarrollador debe configurar sus propias credenciales localmente.

En Vercel las variables deben configurarse desde el panel del proyecto.

---

# 9. Beneficios

La implementación proporciona:

- Validación automática del código.
- Reducción de errores antes del merge.
- Estandarización del flujo de desarrollo.
- Despliegues automáticos.
- Mayor calidad del código.
- Menor riesgo de romper la rama principal.

---

# 10. Tecnologías Utilizadas

- Git
- GitHub
- GitHub Actions
- Next.js 16
- TypeScript
- ESLint
- Jest
- Playwright
- Vercel

---

# 11. Resultado

Al finalizar la implementación se obtuvo un pipeline funcional donde cada Pull Request ejecuta automáticamente:

- Build del proyecto.
- Análisis estático del código.
- Pruebas unitarias.
- Pruebas End-to-End.
- Preview Deployment en Vercel.

Con esta infraestructura el equipo cuenta con un flujo de integración continua básico que servirá como fundamento para las siguientes tareas del proyecto.

---

# 12. Mejoras Futuras

Durante los siguientes sprints esta infraestructura podrá ampliarse con:

- Cobertura de pruebas.
- Quality Gates.
- Code Coverage.
- Deploy automático a producción.
- Integración con Secrets de GitHub.
- Análisis de seguridad (CodeQL).
- Dependabot.
- Automatización de releases.