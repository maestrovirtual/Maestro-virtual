import { test, expect } from '@playwright/test';

test.describe('Tarea 28: Pruebas de integración Frontend-Backend', () => {

  // Cargar la lista de cursos desde API/BD
  test('Debe cargar y desplegar la lista de cursos desde la API/BD', async ({ page }) => {
    // Navegación explícita con el prefijo locale '/es/courses'
    await page.goto('/es/courses');
    await page.waitForLoadState('domcontentloaded');

    // Esperar a que los elementos o enlaces de cursos aparezcan en el DOM
    const courseLinkOrCard = page.locator('a[href*="courses"]').first();
    await expect(courseLinkOrCard).toBeVisible({ timeout: 15000 });

    // Verificar que existan elementos de cursos renderizados
    const allCourseLinks = page.locator('a[href*="courses"]');
    const count = await allCourseLinks.count();
    expect(count).toBeGreaterThan(0);
  });



  // Navegar a la vista de detalle de un curso específico
  test('Debe navegar a la vista de detalle de un curso específico', async ({ page }) => {
    await page.goto('/es/courses');
    await page.waitForLoadState('domcontentloaded');

    // Seleccionar el primer enlace a un curso individual (ej. /es/courses/slug)
    const firstCourseLink = page.locator('a[href*="/courses/"]').first();
    await expect(firstCourseLink).toBeVisible({ timeout: 15000 });

    // Hacer clic y esperar la redirección
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      firstCourseLink.click(),
    ]);

    // Validar cambio de URL al detalle del curso
    await expect(page).toHaveURL(/\/courses\/.+/);

    // Confirmar presencia del título principal h1
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });



  // Enviar el formulario de contacto
  test('Debe completar y enviar el formulario de contacto exitosamente', async ({ page }) => {
    await page.goto('/es/contact');
    await page.waitForLoadState('domcontentloaded');

    // Seleccionar por etiqueta evita confundir el nombre con el honeypot oculto.
    await page.getByLabel('Nombre:', { exact: true }).fill('Usuario Prueba Integración');
    await page.getByLabel('De:', { exact: true }).fill('prueba.integracion@example.com');
    await page.getByLabel('Asunto:', { exact: true }).fill('Prueba automatizada de contacto');
    await page.getByLabel('Mensaje:', { exact: true }).fill('Mensaje de prueba de integración automatizada.');
    await expect(page.locator('input[name="website"]')).toHaveValue('');

    const responsePromise = page.waitForResponse((response) =>
      new URL(response.url()).pathname === '/api/contact' &&
      response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Enviar', exact: true }).click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.id).toEqual(expect.any(String));
    expect(result.id).not.toBe('');
    expect(result.id).not.toBe('skipped');
    await expect(page.getByRole('heading', { name: '¡Correo enviado con éxito!' })).toBeVisible();
  });

});