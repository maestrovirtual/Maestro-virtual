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

test('MV-34: protege historial y envío de respuestas sin sesión', async ({ request }) => {
  const history = await request.get('/api/admin/messages/missing/replies');
  expect(history.status()).toBe(401);
  const send = await request.post('/api/admin/messages/missing/replies', { data: { subject: 'Prueba', body: 'Mensaje' } });
  expect(send.status()).toBe(401);
});

test('MV-34: protege conexión y sincronización de Gmail sin sesión', async ({ request }) => {
  for (const path of ['/api/admin/mailbox/gmail', '/api/admin/mailbox/gmail/connect', '/api/admin/mailbox/gmail/callback']) expect((await request.get(path)).status()).toBe(401);
  expect((await request.post('/api/admin/mailbox/gmail', { data: {} })).status()).toBe(401);
  expect((await request.delete('/api/admin/mailbox/gmail', { data: {} })).status()).toBe(401);
});
