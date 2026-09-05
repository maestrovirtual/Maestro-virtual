# MV-20 · Pipeline de CI/CD con tests automáticos

**Responsable:** Brandon · **Story Points:** 3 · **Épica:** Despliegue en producción y documentación

## Objetivo

Extender el CI básico del Sprint 0 (que solo ejecutaba build y lint) para que además corra automáticamente los tests unitarios que Leo y el equipo vayan escribiendo. Un push cuyos tests fallen debe **bloquear el merge** (o al menos marcarlo claramente en rojo) hacia `main` y `develop`.

---

## Qué corre el pipeline

El pipeline se define en dos archivos dentro de `.github/workflows/`:

### `ci.yml` — corre en cada `push` y `pull_request`

Un solo workflow con **tres jobs en paralelo**:

| Job | Comando | Qué valida |
|-----|---------|------------|
| **ESLint** | `npm run lint` | Reglas de estilo y calidad |
| **Unit Tests (Jest)** | `npm run test -- --ci --coverage` | Tests unitarios + cobertura |
| **Build Next.js** | `npm run build` | Que el proyecto compile |

Los tres jobs comparten cache de `npm` para acelerar la ejecución. Si cualquiera falla, el commit queda marcado en rojo en GitHub.

El job de tests sube el reporte de cobertura como artifact (`jest-coverage`, retención 14 días). Se descarga desde la pestaña **Actions → run del workflow → sección Artifacts**.

### `playwright.yml` — corre en cada `push` y `pull_request`

Un job aparte que ejecuta `npm run test:e2e`. Se separó porque Playwright tarda más (baja browsers, arranca el servidor) y no queremos que bloquee el feedback rápido de los otros jobs.

Al terminar, sube el reporte HTML de Playwright como artifact (`playwright-report`).

---

## Cómo interpretar un check rojo

Cuando abres un PR o haces push, GitHub muestra el estado de cada check. Si ves un check en rojo:

1. **Click en el check rojo** → te lleva al log del job que falló.
2. **Identifica el step que reventó** (los steps completados van en verde, el que falla queda en rojo).
3. **Reproduce localmente** con el mismo comando (ver la tabla de arriba) para no depender del CI en cada iteración.
4. **Corrige y haz un nuevo commit** en la misma rama — el CI vuelve a correr automáticamente.

Errores típicos:

- **Lint rojo:** corre `npm run lint` local y arregla lo que reporte. Muchas reglas se auto-arreglan con `npm run lint -- --fix`.
- **Tests rojos:** corre `npm test` local. Si un test que era verde ahora falla, revisa qué cambió en la funcionalidad que ese test cubre.
- **Build rojo:** corre `npm run build` local. Casi siempre es un error de TypeScript o un import inválido.
- **Playwright rojo:** descarga el artifact `playwright-report`, ábrelo y revisa los screenshots/videos del fallo. Los tests e2e pueden ser flakies — si sospechas de un flake, re-corre el workflow desde la UI antes de asumir un bug real.

---

## Bloqueo de merge (branch protection)

Los workflows corriendo **no bastan** para bloquear el merge — GitHub necesita saber explícitamente qué checks son obligatorios. Esto se activa en **Settings → Branches → Branch protection rules** del repo.

Reglas recomendadas para `main` y `develop`:

- Require a pull request before merging
- Require status checks to pass before merging
  - Required checks: `ESLint`, `Unit Tests (Jest)`, `Build Next.js`
  - (Opcional agresivo: `End-to-End Tests`)
- Require branches to be up to date before merging
- Do not allow bypassing the above settings (para admins también)

### Activación vía CLI (alternativa a la UI)

Si prefieres hacerlo con `gh`:

```bash
gh api -X PUT repos/Brandonschool349/Maestro-virtual/branches/develop/protection \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=ESLint" \
  -f "required_status_checks[contexts][]=Unit Tests (Jest)" \
  -f "required_status_checks[contexts][]=Build Next.js" \
  -F "enforce_admins=true" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -F "restrictions=null"
```

Repite el mismo comando cambiando `develop` por `main`.

> **Nota:** los nombres de los checks (`ESLint`, `Unit Tests (Jest)`, `Build Next.js`) deben coincidir exactamente con el campo `name:` de cada job en `ci.yml`. Si renombras un job, actualiza la branch protection.

---

## Validación local antes de pushear

Para no depender del CI en cada iteración, corre los mismos checks localmente:

```bash
npm run lint                    # ESLint
npm run test -- --ci            # Jest
npm run build                   # Next.js build
npm run test:e2e                # Playwright (más lento)
```

O todos los tests de una:

```bash
npm run test:all                # Jest + Playwright
```

---

## Criterio de aceptación

- [x] El pipeline corre `npm run lint`, `npm test` y `npm run build` en cada push y PR
- [x] Un push con tests unitarios que fallan queda marcado en rojo
- [ ] Branch protection activada en `main` y `develop` (paso manual — ver sección arriba)
- [x] Reporte de cobertura disponible como artifact
- [x] Documentación del pipeline (este archivo)
- [x] Badges de estado en el README principal

---

## Cambios de esta tarea

- Consolidados `build.yml`, `lint.yml` y `test.yml` en un solo `ci.yml` con jobs paralelos, para tener una sola pestaña de checks y ahorrar tiempo por cache compartido de `npm`.
- Agregado `--coverage` al job de Jest y upload del reporte como artifact.
- Agregados badges de CI y Playwright al README principal.
- Actualizada la sección "CI/CD" del README para reflejar la nueva estructura.
