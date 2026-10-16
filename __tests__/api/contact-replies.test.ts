/** @jest-environment node */
import { NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/admin/messages/[id]/replies/route';
import prisma from '@/lib/prisma/client';
import { getStaffUser, requireStaffApi } from '@/lib/auth/dal';
import { contactMailSettings } from '@/lib/mail/contact-settings';
import { sendContactReply } from '@/services/mail/sendContactReply';
jest.mock('@/lib/auth/dal', () => ({ requireStaffApi: jest.fn(), getStaffUser: jest.fn() }));
jest.mock('@/lib/mail/contact-settings', () => ({ contactMailSettings: jest.fn() }));
jest.mock('@/services/mail/sendContactReply', () => ({ sendContactReply: jest.fn() }));
jest.mock('@/lib/prisma/client', () => ({ __esModule: true, default: {
  contactMessage: { findUnique: jest.fn() },
  contactReply: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  $transaction: jest.fn(),
} }));
const id = 'c8f48730-bd80-4910-a7a4-95053ab10276';
const context = { params: Promise.resolve({ id: 'contact-1' }) };
const input = { requestId: id, subject: 'Re: Cursos', body: 'Hola, tenemos cursos disponibles.' };
const mail = { ready: true, from: 'Maestro Virtual <contacto@example.org>', replyTo: 'contacto@example.org', issues: [] };
const record = { id, messageId: 'contact-1', staffId: 'staff-1', staffName: 'Brandon', fromEmail: mail.from, toEmail: 'visitor@example.net', replyTo: mail.replyTo, subject: input.subject, body: input.body, status: 'PENDING', createdAt: new Date(), updatedAt: new Date(), sentAt: null, providerId: null, error: null };
const req = (body: unknown = input, headers: Record<string, string> = { 'Content-Type': 'application/json' }) => new Request('http://localhost/api/admin/messages/contact-1/replies', { method: 'POST', headers, body: JSON.stringify(body) });
beforeEach(() => {
  jest.resetAllMocks();
  (requireStaffApi as jest.Mock).mockResolvedValue(null);
  (getStaffUser as jest.Mock).mockResolvedValue({ id: 'staff-1', name: 'Brandon' });
  (contactMailSettings as jest.Mock).mockReturnValue(mail);
  (prisma.contactMessage.findUnique as jest.Mock).mockResolvedValue({ id: 'contact-1', email: record.toEmail, isSpam: false });
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue(null);
  (prisma.contactReply.create as jest.Mock).mockResolvedValue(record);
  (prisma.contactReply.update as jest.Mock).mockImplementation(async ({ data }) => ({ ...record, ...data }));
  (sendContactReply as jest.Mock).mockResolvedValue({ data: { id: 'resend-1' }, error: null });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());
test.each([401, 403])('protects history and send (%s)', async status => {
  (requireStaffApi as jest.Mock).mockResolvedValue(NextResponse.json({ error: 'Denied' }, { status }));
  expect((await GET(new Request('http://localhost/api/admin/messages/contact-1/replies'), context)).status).toBe(status);
  expect((await POST(req(), context)).status).toBe(status);
  expect(sendContactReply).not.toHaveBeenCalled();
  expect(prisma.contactMessage.findUnique).not.toHaveBeenCalled();
});
test('uses institutional settings and database recipient, persisting audit before sending', async () => {
  const response = await POST(req({ ...input, to: 'other@example.net', from: 'personal@example.net', staffId: 'attacker' }), context);
  expect(response.status).toBe(200);
  expect(prisma.contactReply.create).toHaveBeenCalledWith({ data: expect.objectContaining({ id, staffId: 'staff-1', staffName: 'Brandon', fromEmail: mail.from, toEmail: record.toEmail, replyTo: mail.replyTo }) });
  expect((prisma.contactReply.create as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan((sendContactReply as jest.Mock).mock.invocationCallOrder[0]);
  expect((await response.json()).reply.status).toBe('SENT');
  expect(prisma.contactReply.update).toHaveBeenCalledWith({ where: { id }, data: expect.objectContaining({ status: 'SENT', providerId: 'resend-1' }) });
});
test('blocks unconfigured sender without creating or sending an attempt', async () => {
  (contactMailSettings as jest.Mock).mockReturnValue({ ...mail, ready: false, issues: ['Falta MAIL_FROM'] });
  expect((await POST(req(), context)).status).toBe(503);
  expect(prisma.contactReply.create).not.toHaveBeenCalled();
  expect(sendContactReply).not.toHaveBeenCalled();
});
test('requires a message and refuses replying to spam', async () => {
  (prisma.contactMessage.findUnique as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ isSpam: true });
  expect((await POST(req(), context)).status).toBe(404);
  expect((await POST(req(), context)).status).toBe(409);
  expect(sendContactReply).not.toHaveBeenCalled();
});
test.each([{}, null, { ...input, requestId: 'invalid' }, { ...input, subject: 'Injected\r\nBcc: other@example.org' }, { ...input, body: ' ' }, { ...input, body: 'a'.repeat(10001) }])('validates body %j', async body => {
  expect((await POST(req(body), context)).status).toBe(400);
  expect(sendContactReply).not.toHaveBeenCalled();
});
test('rejects cross origin and non JSON requests', async () => {
  expect((await POST(req(input, { 'Content-Type': 'application/json', origin: 'https://elsewhere.example' }), context)).status).toBe(403);
  expect((await POST(req(input, { 'Content-Type': 'text/plain' }), context)).status).toBe(415);
});
test('repeated completed request returns existing success without resending', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue({ ...record, status: 'SENT' });
  expect((await POST(req(), context)).status).toBe(200);
  expect(sendContactReply).not.toHaveBeenCalled();
});
test.each([{ staffId: 'other-staff' }, { messageId: 'other-contact' }, { body: 'Different response' }])('rejects reuse of request ID for different author or content %j', async patch => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue({ ...record, ...patch });
  expect((await POST(req(), context)).status).toBe(409);
  expect(sendContactReply).not.toHaveBeenCalled();
});
test('retries the same snapshot with the same ID when outcome was uncertain', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue(record);
  expect((await POST(req(), context)).status).toBe(200);
  expect(prisma.contactReply.create).not.toHaveBeenCalled();
  expect(sendContactReply).toHaveBeenCalledWith(record);
});
test('refuses expired attempts outside the provider idempotency window', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue({ ...record, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) });
  expect((await POST(req(), context)).status).toBe(409);
  expect(sendContactReply).not.toHaveBeenCalled();
});
test('prevents a second pending response to the same message', async () => {
  (prisma.contactReply.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
  expect((await POST(req(), context)).status).toBe(409);
  expect(sendContactReply).not.toHaveBeenCalled();
});
test('a network failure remains pending rather than falsely sent or safe to duplicate', async () => {
  (sendContactReply as jest.Mock).mockRejectedValue(new Error('Network interruption'));
  const response = await POST(req(), context);
  expect(response.status).toBe(502);
  expect((await response.json()).reply.status).toBe('PENDING');
  expect(prisma.contactReply.update).not.toHaveBeenCalled();
});
test.each([400, 500])('distinguishes rejection from uncertain provider failure (%s)', async statusCode => {
  (sendContactReply as jest.Mock).mockResolvedValue({ data: null, error: { name: 'error', statusCode } });
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ ...record, status: statusCode === 400 ? 'FAILED' : 'PENDING', error: 'Provider problem' });
  expect((await POST(req(), context)).status).toBe(502);
  expect(prisma.contactReply.updateMany).toHaveBeenCalledWith({ where: { id, status: { not: 'SENT' } }, data: expect.objectContaining({ status: statusCode === 400 ? 'FAILED' : 'PENDING' }) });
});
test('does not report success if sending succeeds but audit persistence fails', async () => {
  (prisma.contactReply.update as jest.Mock).mockRejectedValue(new Error('DB offline'));
  expect((await POST(req(), context)).status).toBe(500);
});
test('history is paginated, private, and identifies retries for the author', async () => {
  (prisma.$transaction as jest.Mock).mockResolvedValue([[record], 21, 1]);
  const response = await GET(new Request('http://localhost/api/admin/messages/contact-1/replies?page=2'), context);
  const data = await response.json();
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(data.replies[0].canRetry).toBe(true);
  expect(data.total).toBe(21);
  expect(data.hasPending).toBe(true);
  expect(prisma.contactReply.findMany).toHaveBeenCalledWith({ where: { messageId: 'contact-1' }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 20, skip: 20 });
});
test('a retry keeps its original sender even if environment settings changed', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue(record);
  (contactMailSettings as jest.Mock).mockReturnValue({ ...mail, from: 'Different <other@example.org>', replyTo: 'other@example.org' });
  expect((await POST(req(), context)).status).toBe(200);
  expect(sendContactReply).toHaveBeenCalledWith(record);
});
test('history does not grant retry permission to another staff member', async () => {
  (prisma.$transaction as jest.Mock).mockResolvedValue([[{ ...record, staffId: 'other-staff' }], 1, 1]);
  const response = await GET(new Request('http://localhost/api/admin/messages/contact-1/replies'), context);
  expect((await response.json()).replies[0].canRetry).toBe(false);
});

test('a failed retry never downgrades an attempt already completed concurrently', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValueOnce({ ...record, status: 'FAILED' }).mockResolvedValueOnce({ ...record, status: 'SENT' });
  expect((await POST(req(), context)).status).toBe(200);
  expect(prisma.contactReply.updateMany).toHaveBeenCalledWith({ where: { id, status: 'FAILED' }, data: { status: 'PENDING', error: null } });
  expect(sendContactReply).not.toHaveBeenCalled();
});
