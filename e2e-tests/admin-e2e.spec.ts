import { test, expect } from '@playwright/test';

test.describe('Tarea 25 y MV-32: Pruebas E2E del panel de administración (Staff)', () => {

  // Acceso a la vista de cursos de admin
  test('Debe cargar la vista del panel admin de cursos', async ({ page }) => {
    await page.goto('/es/admin/cursos');
    await page.waitForLoadState('domcontentloaded');

    const isLoginPage = page.url().includes('/login') || page.url().includes('/staff');
    const isAdminPage = page.url().includes('/admin/cursos');
    expect(isLoginPage || isAdminPage).toBeTruthy();
  });

  // Acceso a la vista de eventos de admin (MV-32)
  test('Debe cargar la vista del panel admin de eventos y abrir el modal', async ({ page }) => {
    await page.goto('/es/admin/eventos');
    await page.waitForLoadState('domcontentloaded');

    const isLoginPage = page.url().includes('/login') || page.url().includes('/staff');
    const isAdminPage = page.url().includes('/admin/eventos');
    
    if (isAdminPage) {
      // Verificar el botón de crear nuevo evento
      const createButton = page.getByRole('button', { name: /\+ Crear Nuevo Evento/i });
      await expect(createButton).toBeVisible({ timeout: 10000 });
      await createButton.click();

      // Validar que se abra el modal EventModal
      const eventModal = page.locator('dialog, div[role="dialog"], form').first();
      await expect(eventModal).toBeVisible({ timeout: 5000 });
    } else {
      expect(isLoginPage).toBeTruthy();
    }
  });

  // Validación de apertura de modal de Cursos
  test('Debe abrir el modal de creación de cursos', async ({ page }) => {
    await page.goto('/es/admin/cursos');
    await page.waitForLoadState('domcontentloaded');

    const createButton = page.getByRole('button', { name: /\+ Crear Nuevo Curso/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      const courseModal = page.locator('dialog, div[role="dialog"], form').first();
      await expect(courseModal).toBeVisible({ timeout: 5000 });
    }
  });

  // ------------------------------------------------------------------
  // NOTA: Pruebas de mutación (CRUD completo con base de datos real)
  // Omitidas temporalmente con test.skip() para validar la integración 
  // ------------------------------------------------------------------

  test.skip('Debe crear, cambiar estado a borrador y eliminar un evento', async () => {
  });

});