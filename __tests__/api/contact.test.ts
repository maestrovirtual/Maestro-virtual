/** @jest-environment node */
import { POST } from '@/app/api/contact/route';
import prisma from '@/lib/prisma/client';
import { sendContactEmail } from '@/services/mail/sendContactEmail';
import { resolveMx } from 'node:dns/promises';

jest.mock('node:dns/promises', () => ({ resolveMx: jest.fn() }));
jest.mock('@/services/mail/sendContactEmail', () => ({ sendContactEmail: jest.fn() }));
jest.mock('@/lib/prisma/client', () => ({ __esModule: true, default: { contactMessage: { create: jest.fn() } } }));
let ip = 0;
const payload = { name: ' Ana ', email: 'ana@example.com', category: 'CURSOS', message: ' Quiero información ' };
const request = (body: unknown = payload) => new Request('http://localhost/api/contact', {
  method: 'POST', headers: { 'x-real-ip': `test-${ip++}` }, body: JSON.stringify(body),
});
beforeEach(() => {
  jest.clearAllMocks();
  (resolveMx as jest.Mock).mockResolvedValue([{ exchange: 'mail.example.com' }]);
  (prisma.contactMessage.create as jest.Mock).mockResolvedValue({ id: 'saved' });
  (sendContactEmail as jest.Mock).mockResolvedValue({ data: { id: 'email' }, error: null });
});
test('stores the normalized message before sending notification', async () => {
  const response = await POST(request());
  expect(await response.json()).toEqual({ success: true, id: 'saved', notificationSent: true });
  expect(prisma.contactMessage.create).toHaveBeenCalledWith({ data: { name: 'Ana', email: 'ana@example.com', subject: 'Cursos', category: 'CURSOS', message: 'Quiero información', isSpam: false } });
  expect((prisma.contactMessage.create as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan((sendContactEmail as jest.Mock).mock.invocationCallOrder[0]);
});
test.each(['returned', 'thrown'])('retains a received message when notification fails (%s)', async mode => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  if (mode === 'returned') (sendContactEmail as jest.Mock).mockResolvedValue({ error: { message: 'offline' } });
  else (sendContactEmail as jest.Mock).mockRejectedValue(new Error('offline'));
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ success: true, id: 'saved', notificationSent: false });
  log.mockRestore();
});
test('does not send email when storage fails', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  (prisma.contactMessage.create as jest.Mock).mockRejectedValue(new Error('offline'));
  expect((await POST(request())).status).toBe(500);
  expect(sendContactEmail).not.toHaveBeenCalled();
  log.mockRestore();
});
test('does not store honeypot submissions', async () => {
  await POST(request({ ...payload, website: 'spam' }));
  expect(prisma.contactMessage.create).not.toHaveBeenCalled();
});

test('stores suspicious content directly in spam without sending notification', async () => {
  const response = await POST(request({ ...payload, message: 'Ganaste un premio. Reclama ahora, haz clic https://example.com/premio' }));
  expect(response.status).toBe(200);
  expect(prisma.contactMessage.create).toHaveBeenCalledWith({ data: expect.objectContaining({ isSpam: true }) });
  expect(sendContactEmail).not.toHaveBeenCalled();
  expect(await response.json()).toEqual({ success: true, id: 'saved', notificationSent: false });
});

test.each([undefined, '', 'PAGOS', 'cursos'])('rejects a missing or unknown category %j', async category => {
  const response = await POST(request({ ...payload, category }));
  expect(response.status).toBe(400);
  expect(prisma.contactMessage.create).not.toHaveBeenCalled();
});
test('stores spam with the category the visitor selected', async () => {
  await POST(request({ ...payload, category: 'EVENTOS', message: 'Ganaste un premio. Reclama ahora, haz clic https://example.com/premio' }));
  expect(prisma.contactMessage.create).toHaveBeenCalledWith({ data: expect.objectContaining({ category: 'EVENTOS', isSpam: true }) });
});
