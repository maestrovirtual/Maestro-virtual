import { test, expect } from '@playwright/test';

for (const locale of ['es', 'en']) {
  test(`MV-34: protege la bandeja sin sesión (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}/admin/mensajes`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/staff/login$`));
    await expect(page.getByRole('heading', { name: 'Acceso para staff' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mensajes de contacto' })).toHaveCount(0);
  });
}

test('MV-34: protege lectura y cambio de estado del API sin sesión', async ({ request }) => {
  const list = await request.get('/api/admin/messages');
  expect(list.status()).toBe(401);
  const update = await request.patch('/api/admin/messages/missing', { data: { isRead: true } });
  expect(update.status()).toBe(401);
});
