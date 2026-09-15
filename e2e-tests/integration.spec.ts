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

    // Si el formulario no usa la etiqueta <form>, buscamos por inputs o por contenedor
    const nameInput = page.locator('input[name="name"], input[type="text"]').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Llenar campos del formulario
    await nameInput.fill('Usuario Prueba Integración');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('prueba.integracion@example.com');
    }

    const messageInput = page.locator('textarea').first();
    if (await messageInput.isVisible()) {
      await messageInput.fill('Mensaje de prueba de integración automatizada.');
    }

    // Ubicar botón de envío
    const submitBtn = page.locator('button[type="submit"], button:has-text("Enviar"), button:has-text("Send")').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Confirmar que la página procesó la solicitud sin fallos críticos de servidor
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

});