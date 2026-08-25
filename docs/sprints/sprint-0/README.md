# MV-13 - Git Workflow

## Objetivo

Definir un flujo de trabajo basado en Git Flow para el desarrollo de Maestro Virtual, estableciendo una estrategia de ramas, Pull Requests y validaciones automáticas mediante GitHub Actions.

---

# Alcance

Durante esta tarea se configuró la base del flujo de trabajo del repositorio para facilitar el desarrollo colaborativo.

Incluye:

- Estrategia de ramas.
- Integración con GitHub.
- Configuración inicial de GitHub Actions.
- Validaciones automáticas.
- Convenciones para Pull Requests.

---

# Estrategia de ramas

Se utiliza una variante de Git Flow.

## Ramas principales

- `main`
  - Contiene únicamente versiones estables.

- `develop`
  - Rama principal de desarrollo.
  - Todas las funcionalidades terminadas llegan primero aquí.

## Ramas temporales

### Feature

```
feature/MV-XX-nombre
```

Ejemplo:

```
feature/MV-19-mail-service
```

Se utilizan para desarrollar nuevas funcionalidades.

---

### Chore

```
chore/MV-XX-descripcion
```

Ejemplo:

```
chore/MV-13-document-git-workflow
```

Se utilizan para:

- documentación
- configuración
- mantenimiento
- CI/CD
- mejoras internas

---

### Fix

```
fix/MV-XX-descripcion
```

Para correcciones de errores.

---

# Flujo de trabajo

1. Crear rama desde `develop`.

2. Desarrollar la funcionalidad.

3. Realizar commits descriptivos.

Ejemplo:

```
feat: integrate resend email service
```

4. Hacer Push.

5. Abrir Pull Request hacia `develop`.

6. Esperar validaciones automáticas.

7. Solicitar revisión.

8. Realizar Merge.

---

# GitHub Actions

Actualmente el proyecto ejecuta automáticamente:

- Build de Next.js
- ESLint
- Jest
- Playwright

Las validaciones se ejecutan en:

- Push
- Pull Request

para cualquier rama del repositorio.

---

# Reglas

- No realizar commits directamente a `main`.

- No realizar commits directamente a `develop`.

- Todo cambio debe pasar mediante Pull Request.

- Todos los checks deben aprobarse antes del Merge.

---

# Convención de commits

Se utiliza Conventional Commits.

Ejemplos:

```
feat:
fix:
docs:
refactor:
test:
style:
chore:
ci:
```

Ejemplo:

```
feat: integrate resend email service

ci: run workflows on all branches

docs: update project documentation
```

---

# Resultado

Con esta tarea quedó establecida la base del flujo de trabajo del proyecto, permitiendo que todos los integrantes desarrollen funcionalidades de forma independiente, con validaciones automáticas y un proceso de integración consistente.