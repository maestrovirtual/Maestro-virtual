import { test, expect } from '@playwright/test';

test.describe('Flujo de Contacto (E2E)', () => {
  test('debe permitir a un usuario llenar todos los campos y enviar el formulario de contacto', async ({ page }) => {
    // 1. Visitar la página principal
    await page.goto('/');

    // 2. Navegar a la sección de contacto mediante el menú
    const contactNavLink = page.getByRole('link', { name: /contacto/i }).first();
    await contactNavLink.click();

    // 3. Esperar a que la animación de entrada se complete
    await page.waitForTimeout(500);

    // 4. Seleccionar los campos dentro del formulario
    const inputs = page.locator('form input');
    const textarea = page.locator('form textarea');

    // 5. Llenar los 4 campos (Nombre, Correo, Asunto, Mensaje)
    await inputs.nth(0).fill('Leo E2E', { force: true });
    await inputs.nth(1).fill('leo.e2e@ejemplo.com', { force: true });
    await inputs.nth(2).fill('Consulta sobre Maestro Virtual', { force: true });
    await textarea.fill('Hola, este es un mensaje de prueba automatizado.', { force: true });

    // 6. Verificar que el botón de enviar exista y hacer clic
    const submitButton = page.getByRole('button', { name: /enviar/i });
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // 7. Dar un momento para que se procese el envío
    await page.waitForTimeout(1000);
  });
});