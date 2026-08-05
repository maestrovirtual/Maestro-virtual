# MV-14: Configuración de Jest y Playwright

# Descripción General
Implementación y configuración del entorno de pruebas End-to-End (E2E) con Playwright, así como la separación y aislamiento del marco de pruebas unitarias (Jest) para garantizar ejecuciones independientes, rápidas y estables tanto en el entorno local como en Integración Continua (GitHub Actions).

# Cambios Realizados
1. Configuración de Playwright (Pruebas E2E)
Se integró Playwright para la automatización de flujos de usuario completos.

Se estableció la carpeta e2e-tests/ para alojar las especificaciones E2E (ej. contact.spec.ts para la validación del formulario de contacto).

Se validó la ejecución correcta de las pruebas E2E levantando automáticamente el servidor local.

2. Aislamiento entre Jest y Playwright
Problema: Jest intentaba interpretar los archivos .spec.ts dentro de e2e-tests/, generando errores por incompatibilidad de entorno entre Node/Jsdom y los navegadores de Playwright.

Solución: Se actualizó jest.config.mjs mediante las propiedades testMatch y testPathIgnorePatterns para que Jest únicamente busque pruebas dentro de __tests__/ e ignore por completo la carpeta e2e-tests/.

3. Estandarización de Comandos (package.json)
Se añadieron y organizaron los scripts de ejecución para facilitar el flujo de desarrollo:

"npm run test" Ejecuta exclusivamente las pruebas unitarias de componentes con Jest.

"npm run test:e2e" Ejecuta las pruebas E2E con Playwright.

"npx playwright test --ui" Abre la interfaz gráfica interactiva para ver, ejecutar y depurar pruebas paso a paso de playwright.

"npx playwright show-report" Despliega el reporte gráfico HTML de la última ejecución de playwright.

"npm run test:all" Ejecuta ambas suites de forma secuencial (npm run test && npm run test:e2e).

4. Ajustes en Integración Continua (GitHub Actions)
Sincronización de package-lock.json: Se resolvió la discrepancia de dependencias (@swc/helpers) para garantizar que npm ci instale los paquetes correctamente en los runners de GitHub Actions.

Actualización de Triggers (playwright.yml): Se agregó la rama develop al bloque on.push y on.pull_request en .github/workflows/playwright.yml, asegurando que las pruebas de Playwright se ejecuten automáticamente en Pull Requests dirigidas a develop.