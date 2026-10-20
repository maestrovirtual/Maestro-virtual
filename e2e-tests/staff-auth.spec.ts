import { test, expect } from '@playwright/test';

// MV-33: un usuario sin rol staff no puede acceder a las rutas del panel,
// ni escribiendo la URL directamente.
test.describe('MV-33: Autenticacion de staff para el panel', () => {
  for (const path of ['/es/admin', '/es/admin/cursos', '/en/admin/courses']) {
    test(`Debe mandar al login al entrar directo a ${path} sin sesion`, async ({ page }) => {
      const locale = path.split('/')[1];

      await page.goto(path);

      await expect(page).toHaveURL(new RegExp(`/${locale}/staff/login$`));
      await expect(page.getByRole('heading', { name: 'Acceso para staff' })).toBeVisible();
      await expect(page.getByText('Resumen General')).toHaveCount(0);
    });
  }

  test('Debe mantener al visitante en el login con credenciales incorrectas', async ({ page }) => {
    // Se simula la respuesta del API para no depender de la base de datos del
    // entorno de CI. El login real contra la BD lo cubre __tests__/api/auth.test.ts.
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Correo o contraseña incorrectos' }),
      })
    );

    await page.goto('/es/staff/login');

    await page.getByLabel('Correo').fill('no-existe@maestrovirtual.test');
    await page.getByLabel('Contraseña').fill('contraseña-incorrecta');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByText('Correo o contraseña incorrectos')).toBeVisible();
    await expect(page).toHaveURL(/\/es\/staff\/login$/);
  });
});
