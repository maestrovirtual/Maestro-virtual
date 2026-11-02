/** @jest-environment node */
import prisma from '@/lib/prisma/client';
import { encryptGmailToken, decryptGmailToken, gmailBody, gmailSubject, sendGmailReply, syncGmail, GmailError, replyMailSettings } from '@/lib/mail/gmail';
jest.mock('@/lib/prisma/client', () => ({ __esModule: true, default: {
  contactMailbox: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  contactReply: { findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), groupBy: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  contactMessage: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  $transaction: jest.fn(),
} }));
const originalEnv = process.env;
const fetchMock = jest.fn();
const id = 'c8f48730-bd80-4910-a7a4-95053ab10276';
const row = { id, messageId: 'contact-1', fromEmail: 'Maestro Virtual <institution@gmail.com>', toEmail: 'visitor@example.org', replyTo: 'institution@gmail.com', subject: 'Re: Información', body: 'Hola, aquí está la información.', gmailDraftId: null, status: 'PENDING' };
const draftData = { message: { id: 'draft-message', threadId: 'thread-1', payload: { mimeType: 'text/plain', headers: [{ name: 'To', value: row.toEmail }, { name: 'From', value: row.fromEmail }, { name: 'Reply-To', value: row.replyTo }, { name: 'Subject', value: row.subject }, { name: 'Message-ID', value: `<mv-${id}@maestro-virtual.invalid>` }], body: { data: Buffer.from(row.body).toString('base64url') } } } };
const json = (data: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });
const incoming = { id: 'incoming-1', threadId: 'thread-1', internalDate: '1792134000000', payload: { mimeType: 'text/plain', headers: [{ name: 'From', value: 'Visitor <visitor@example.org>' }, { name: 'References', value: `<mv-${id}@maestro-virtual.invalid>` }, { name: 'Subject', value: 'Re: Información' }, { name: 'Message-ID', value: '<received@example.org>' }], body: { data: Buffer.from('Gracias, quiero inscribirme.').toString('base64url') } } };
beforeEach(() => {
  jest.resetAllMocks();
  process.env = { ...originalEnv, AUTH_SECRET: 'secret-for-encryption-at-least-32-characters', GMAIL_TOKEN_SECRET: '', MAIL_PROVIDER: 'gmail', GMAIL_ACCOUNT_EMAIL: 'institution@gmail.com', GMAIL_CLIENT_ID: 'client-id', GMAIL_CLIENT_SECRET: 'private-client-secret', GMAIL_OAUTH_REDIRECT_URI: 'http://localhost:3000/api/admin/mailbox/gmail/callback' };
  global.fetch = fetchMock;
  (prisma.contactMailbox.findUnique as jest.Mock).mockResolvedValue({ id: 'institution', email: 'institution@gmail.com', historyId: '100', encryptedRefreshToken: encryptGmailToken('private-refresh-token', Buffer.alloc(12, 1)) });
  (prisma.contactMailbox.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  (prisma.contactReply.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue(null);
  (prisma.contactReply.findMany as jest.Mock).mockResolvedValue([]);
  (prisma.contactReply.findFirst as jest.Mock).mockResolvedValue(null);
  (prisma.contactReply.groupBy as jest.Mock).mockResolvedValue([]);
  (prisma.contactMessage.findUnique as jest.Mock).mockResolvedValue({ id: 'contact-1', email: 'visitor@example.org', name: 'Ana' });
  (prisma.$transaction as jest.Mock).mockImplementation(async callback => callback(prisma));
  fetchMock.mockImplementation(async (url: string) => {
    if (url.includes('oauth2.googleapis.com/token')) return json({ access_token: 'access-token' });
    if (url.includes('/history?')) return json({ historyId: '200', history: [{ messagesAdded: [{ message: { id: 'incoming-1', threadId: 'thread-1' } }] }] });
    if (url.includes('/messages/incoming-1?')) return json(incoming);
    throw new Error(`Unexpected request: ${url}`);
  });
});
afterEach(() => { process.env = originalEnv; });
test('encrypts tokens and detects tampering or a changed encryption key', () => {
  const encrypted = encryptGmailToken('sensitive-refresh-token', Buffer.alloc(12, 2));
  expect(encrypted).not.toContain('sensitive-refresh-token');
  expect(decryptGmailToken(encrypted)).toBe('sensitive-refresh-token');
  process.env.GMAIL_TOKEN_SECRET = 'different-secret-with-at-least-32-characters';
  expect(() => decryptGmailToken(encrypted)).toThrow();
});
test('reports Gmail sender without requiring Resend or exposing refresh credentials', async () => {
  const settings = await replyMailSettings('gmail');
  expect(settings).toEqual({ ready: true, from: row.fromEmail, replyTo: row.replyTo, issues: [], provider: 'gmail' });
  expect(JSON.stringify(settings)).not.toContain('private-refresh-token');
});
test('creates and persists a stable draft before sending and encodes MIME safely', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue(row);
  fetchMock.mockResolvedValueOnce(json({ access_token: 'access-token' })).mockResolvedValueOnce(json({ id: 'draft-1' })).mockResolvedValueOnce(json(draftData)).mockResolvedValueOnce(json({ id: 'sent-1', threadId: 'thread-1' }));
  expect(await sendGmailReply(row)).toEqual({ id: 'sent-1', threadId: 'thread-1' });
  const draft = JSON.parse(fetchMock.mock.calls[1][1].body);
  const raw = Buffer.from(draft.message.raw, 'base64url').toString('utf8');
  expect(raw).toContain(`Message-ID: <mv-${id}@maestro-virtual.invalid>`);
  expect(raw).toContain(`From: ${row.fromEmail}`);
  expect(raw).toContain('Content-Type: text/plain; charset=UTF-8');
  expect(prisma.contactReply.update).toHaveBeenCalledWith({ where: { id }, data: { gmailDraftId: 'draft-1', rfcMessageId: `<mv-${id}@maestro-virtual.invalid>` } });
  expect((prisma.contactReply.update as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(fetchMock.mock.invocationCallOrder[3]);
  expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ id: 'draft-1' });
});
test('a concurrent attempt cannot create a second draft', async () => {
  (prisma.contactReply.updateMany as jest.Mock).mockResolvedValueOnce({ count: 0 });
  await expect(sendGmailReply(row)).rejects.toMatchObject({ status: 409 });
  expect(fetchMock).not.toHaveBeenCalled();
});
test('reconciles an already sent draft without sending another message', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue({ ...row, gmailDraftId: 'draft-1' });
  fetchMock.mockResolvedValueOnce(json({ access_token: 'access-token' })).mockResolvedValueOnce(json({ messages: [{ id: 'sent-1', threadId: 'thread-1' }] }));
  expect(await sendGmailReply(row)).toEqual({ id: 'sent-1', threadId: 'thread-1' });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(prisma.contactReply.update).not.toHaveBeenCalled();
});
test('retries only the persisted draft ID; a disappeared draft remains uncertain', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue({ ...row, gmailDraftId: 'draft-1' });
  fetchMock.mockResolvedValueOnce(json({ access_token: 'access-token' })).mockResolvedValueOnce(json({ messages: [] })).mockResolvedValueOnce(json({}, 404));
  await expect(sendGmailReply(row)).rejects.toBeInstanceOf(GmailError);
  expect(fetchMock.mock.calls.some(call => call[0].endsWith('/drafts'))).toBe(false);
  expect(fetchMock.mock.calls[2][0]).toContain('/drafts/draft-1?format=full');
});
test('imports only a known contact reply, reopens the thread unread, and advances history', async () => {
  (prisma.contactReply.findMany as jest.Mock).mockResolvedValue([{ messageId: 'contact-1', rfcMessageId: `<mv-${id}@maestro-virtual.invalid>` }]);
  expect(await syncGmail()).toEqual({ imported: 1, more: false });
  expect(prisma.contactReply.create).toHaveBeenCalledWith({ data: expect.objectContaining({ direction: 'INBOUND', provider: 'gmail', providerId: 'incoming-1', staffId: null, body: 'Gracias, quiero inscribirme.', fromEmail: 'visitor@example.org' }) });
  expect(prisma.contactMessage.update).toHaveBeenCalledWith({ where: { id: 'contact-1' }, data: { isRead: false, isArchived: false } });
  expect(prisma.contactMailbox.update).toHaveBeenCalledWith({ where: { id: 'institution' }, data: expect.objectContaining({ historyId: '200', nextPageToken: null }) });
});
test('ignores unrelated mailbox messages without downloading their bodies', async () => {
  fetchMock.mockImplementation(async (url: string) => {
    if (url.includes('/token')) return json({ access_token: 'access-token' });
    if (url.includes('/history?')) return json({ historyId: '200', history: [{ messagesAdded: [{ message: { id: 'unrelated', threadId: 'other' } }] }] });
    return json({ id: 'unrelated', threadId: 'other', payload: { headers: [{ name: 'From', value: 'unknown@example.net' }] } });
  });
  expect(await syncGmail()).toEqual({ imported: 0, more: false });
  expect(fetchMock.mock.calls.some(call => call[0].includes('format=full'))).toBe(false);
  expect(prisma.contactReply.create).not.toHaveBeenCalled();
});
test('deduplicates imported emails without resetting their read state', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue({ id: 'already-imported' });
  expect(await syncGmail()).toEqual({ imported: 0, more: false });
  expect(prisma.contactMessage.update).not.toHaveBeenCalled();
});
test('rejects a different sender in a known thread before downloading the body', async () => {
  (prisma.contactReply.findMany as jest.Mock).mockResolvedValue([{ messageId: 'contact-1', rfcMessageId: null }]);
  (prisma.contactMessage.findUnique as jest.Mock).mockResolvedValue({ id: 'contact-1', email: 'another@example.org' });
  expect(await syncGmail()).toEqual({ imported: 0, more: false });
  expect(fetchMock.mock.calls.some(call => call[0].includes('format=full'))).toBe(false);
});
test('does not advance history after a database failure during import', async () => {
  (prisma.contactReply.findMany as jest.Mock).mockResolvedValue([{ messageId: 'contact-1', rfcMessageId: null }]);
  (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('DB offline'));
  await expect(syncGmail()).rejects.toThrow('DB offline');
  expect(prisma.contactMailbox.update).not.toHaveBeenCalled();
  expect(prisma.contactMailbox.updateMany).toHaveBeenLastCalledWith({ where: { id: 'institution', leaseUntil: expect.any(Date) }, data: { leaseUntil: null } });
});
test('expired history triggers bounded thread recovery instead of losing future replies', async () => {
  fetchMock.mockResolvedValueOnce(json({ access_token: 'access-token' })).mockResolvedValueOnce(json({}, 404));
  expect(await syncGmail()).toEqual({ imported: 0, more: true });
  expect(prisma.contactMailbox.update).toHaveBeenCalledWith({ where: { id: 'institution' }, data: { historyId: null, nextPageToken: null, recoveryCursor: null } });
});
test('prefers plain text, strips remote HTML, and decodes encoded subjects', () => {
  expect(gmailBody({ id: 'x', threadId: 't', payload: { mimeType: 'text/html', body: { data: Buffer.from('<script>bad()</script><p>Hola<br>Gracias</p><img src="https://tracking.example/a">').toString('base64url') } } })).toBe('Hola\nGracias');
  expect(gmailSubject('=?UTF-8?B?SW5mb3JtYWNpw7Nu?=')).toBe('Información');
});
test('a draft edited in Gmail cannot send different content through the panel', async () => {
  (prisma.contactReply.findUnique as jest.Mock).mockResolvedValue({ ...row, gmailDraftId: 'draft-1' });
  fetchMock.mockResolvedValueOnce(json({ access_token: 'access-token' })).mockResolvedValueOnce(json({ messages: [] })).mockResolvedValueOnce(json({ message: { ...draftData.message, payload: { ...draftData.message.payload, body: { data: Buffer.from('Edited elsewhere').toString('base64url') } } } }));
  await expect(sendGmailReply(row)).rejects.toMatchObject({ status: 400 });
  expect(fetchMock.mock.calls.some(call => call[0].endsWith('/drafts/send'))).toBe(false);
});
test('thread recovery uses database grouping with a bounded batch', async () => {
  (prisma.contactMailbox.findUnique as jest.Mock).mockResolvedValue({ id: 'institution', email: 'institution@gmail.com', historyId: null, encryptedRefreshToken: encryptGmailToken('refresh', Buffer.alloc(12, 1)) });
  fetchMock.mockResolvedValueOnce(json({ access_token: 'access-token' })).mockResolvedValueOnce(json({ historyId: '300' }));
  expect(await syncGmail()).toEqual({ imported: 0, more: false });
  expect(prisma.contactReply.groupBy).toHaveBeenCalledWith(expect.objectContaining({ by: ['providerThreadId'], take: 5 }));
  expect(prisma.contactMailbox.update).toHaveBeenCalledWith({ where: { id: 'institution' }, data: expect.objectContaining({ historyId: '300' }) });
});
test('imports a reply sent from the institutional Gmail app into an existing thread', async () => {
  (prisma.contactReply.findMany as jest.Mock).mockResolvedValue([{ messageId: 'contact-1', rfcMessageId: null }]);
  const external = { ...incoming, labelIds: ['SENT'], payload: { ...incoming.payload, headers: [{ name: 'From', value: 'institution@gmail.com' }, { name: 'To', value: 'visitor@example.org' }, { name: 'Subject', value: 'Re: Información' }] } };
  fetchMock.mockImplementation(async (url: string) => url.includes('/token') ? json({ access_token: 'access-token' }) : url.includes('/history?') ? json({ historyId: '200', history: [{ messagesAdded: [{ message: { id: 'incoming-1', threadId: 'thread-1' } }] }] }) : json(external));
  expect(await syncGmail()).toEqual({ imported: 1, more: false });
  expect(prisma.contactReply.create).toHaveBeenCalledWith({ data: expect.objectContaining({ direction: 'OUTBOUND', staffId: null, staffName: 'Cuenta institucional (Gmail)' }) });
  expect(prisma.contactMessage.update).not.toHaveBeenCalled();
});
