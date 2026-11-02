/** @jest-environment node */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GET as connect } from '@/app/api/admin/mailbox/gmail/connect/route';
import { GET as callback } from '@/app/api/admin/mailbox/gmail/callback/route';
import { GET, POST, DELETE } from '@/app/api/admin/mailbox/gmail/route';
import { requireStaffApi, getStaffUser } from '@/lib/auth/dal';
import { gmailConfig, googleToken, gmailRequest, encryptGmailToken, decryptGmailToken, syncGmail, GMAIL_SCOPES } from '@/lib/mail/gmail';
import prisma from '@/lib/prisma/client';
jest.mock('@/lib/auth/dal', () => ({ requireStaffApi: jest.fn(), getStaffUser: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/mail/gmail', () => ({ gmailConfig: jest.fn(), googleToken: jest.fn(), gmailRequest: jest.fn(), encryptGmailToken: jest.fn(), decryptGmailToken: jest.fn(), syncGmail: jest.fn(), GMAIL_SCOPES: ['scope-readonly', 'scope-compose'] }));
jest.mock('@/lib/prisma/client', () => ({ __esModule: true, default: { contactMailbox: { findUnique: jest.fn(), upsert: jest.fn(), delete: jest.fn() } } }));
const config = { clientId: 'client-id', clientSecret: 'private-client-secret', redirectUri: 'http://localhost:3000/api/admin/mailbox/gmail/callback', account: 'institution@gmail.com' };
const req = (method = 'POST', origin = 'http://localhost:3000') => new Request('http://localhost:3000/api/admin/mailbox/gmail', { method, headers: { 'Content-Type': 'application/json', origin }, body: '{}' });
beforeEach(() => {
  jest.resetAllMocks();
  process.env.MAIL_PROVIDER = 'gmail';
  (requireStaffApi as jest.Mock).mockResolvedValue(null);
  (getStaffUser as jest.Mock).mockResolvedValue({ id: 'staff-1', name: 'Brandon' });
  (gmailConfig as jest.Mock).mockReturnValue(config);
  (cookies as jest.Mock).mockResolvedValue({ get: () => ({ value: JSON.stringify({ state: 'nonce', verifier: 'pkce-verifier', staffId: 'staff-1', at: Date.now() }) }) });
  (googleToken as jest.Mock).mockResolvedValue({ access_token: 'private-access-token', refresh_token: 'private-refresh-token', scope: GMAIL_SCOPES.join(' ') });
  (gmailRequest as jest.Mock).mockResolvedValue({ emailAddress: config.account, historyId: '123' });
  (encryptGmailToken as jest.Mock).mockReturnValue('encrypted-token');
  (prisma.contactMailbox.findUnique as jest.Mock).mockResolvedValue(null);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());
test.each([401, 403])('all Gmail endpoints require staff (%s)', async status => {
  (requireStaffApi as jest.Mock).mockResolvedValue(NextResponse.json({ error: 'Denied' }, { status }));
  for (const response of [await GET(), await POST(req()), await DELETE(req('DELETE')), await connect(), await callback(new Request(`${config.redirectUri}?state=nonce&code=code`))]) expect(response.status).toBe(status);
  expect(googleToken).not.toHaveBeenCalled();
  expect(syncGmail).not.toHaveBeenCalled();
});
test('OAuth uses state, PKCE and an HttpOnly short-lived cookie without leaking the client secret', async () => {
  const response = await connect();
  const location = new URL(response.headers.get('location')!);
  expect(location.origin).toBe('https://accounts.google.com');
  expect(location.searchParams.get('code_challenge_method')).toBe('S256');
  expect(location.searchParams.get('scope')).toBe(GMAIL_SCOPES.join(' '));
  expect(location.searchParams.get('client_secret')).toBeNull();
  const cookie = JSON.parse(response.cookies.get('mv_gmail_oauth')!.value);
  expect(cookie.state).toBe(location.searchParams.get('state'));
  expect(cookie.staffId).toBe('staff-1');
  expect(response.headers.get('set-cookie')).toContain('HttpOnly');
});
test('missing OAuth configuration blocks connecting', async () => {
  (gmailConfig as jest.Mock).mockReturnValue({ ...config, clientSecret: '' });
  expect((await connect()).status).toBe(503);
});
test('callback binds authorization to the staff session and encrypts refresh tokens', async () => {
  const response = await callback(new Request(`${config.redirectUri}?state=nonce&code=authorization-code`));
  expect(response.headers.get('location')).toContain('gmail=connected');
  expect(googleToken).toHaveBeenCalledWith({ grant_type: 'authorization_code', code: 'authorization-code', redirect_uri: config.redirectUri, code_verifier: 'pkce-verifier' });
  expect(prisma.contactMailbox.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ email: config.account, encryptedRefreshToken: 'encrypted-token', connectedBy: 'staff-1' }) }));
  expect(response.headers.get('location')).not.toContain('private');
});
test('wrong state never exchanges a code', async () => {
  const response = await callback(new Request(`${config.redirectUri}?state=wrong&code=code`));
  expect(response.headers.get('location')).toContain('gmail=invalid_state');
  expect(googleToken).not.toHaveBeenCalled();
});
test('a different logged-in staff member cannot complete another OAuth flow', async () => {
  (getStaffUser as jest.Mock).mockResolvedValue({ id: 'staff-2' });
  const response = await callback(new Request(`${config.redirectUri}?state=nonce&code=code`));
  expect(response.headers.get('location')).toContain('gmail=invalid_state');
  expect(prisma.contactMailbox.upsert).not.toHaveBeenCalled();
});
test('connecting a personal Google account instead of the institution is rejected', async () => {
  (gmailRequest as jest.Mock).mockResolvedValue({ emailAddress: 'personal@gmail.com', historyId: '123' });
  const response = await callback(new Request(`${config.redirectUri}?state=nonce&code=code`));
  expect(response.headers.get('location')).toContain('gmail=wrong_account');
  expect(prisma.contactMailbox.upsert).not.toHaveBeenCalled();
});
test('refusing permissions or offline access never stores an incomplete connection', async () => {
  (googleToken as jest.Mock).mockResolvedValue({ access_token: 'token', scope: 'scope-readonly' });
  const response = await callback(new Request(`${config.redirectUri}?state=nonce&code=code`));
  expect(response.headers.get('location')).toContain('gmail=missing_permissions');
  expect(prisma.contactMailbox.upsert).not.toHaveBeenCalled();
});
test('status returns only public connection metadata', async () => {
  (prisma.contactMailbox.findUnique as jest.Mock).mockResolvedValue({ email: config.account, lastSyncedAt: null, lastError: null });
  const response = await GET();
  const data = await response.json();
  expect(data.connected).toBe(true);
  expect(JSON.stringify(data)).not.toContain('secret');
  expect(prisma.contactMailbox.findUnique).toHaveBeenCalledWith({ where: { id: 'institution' }, select: { email: true, lastSyncedAt: true, lastError: true } });
});
test('cross-origin sync and disconnect are rejected', async () => {
  expect((await POST(req('POST', 'https://untrusted.example'))).status).toBe(403);
  expect((await DELETE(req('DELETE', 'https://untrusted.example'))).status).toBe(403);
  expect(syncGmail).not.toHaveBeenCalled();
});
test('sync returns the imported count from the server', async () => {
  (syncGmail as jest.Mock).mockResolvedValue({ imported: 1, more: false });
  expect(await (await POST(req())).json()).toEqual({ imported: 1, more: false });
});
test('disconnect revokes the Google token before deleting the connection, preserving messages', async () => {
  (prisma.contactMailbox.findUnique as jest.Mock).mockResolvedValue({ id: 'institution', encryptedRefreshToken: 'ciphertext' });
  (decryptGmailToken as jest.Mock).mockReturnValue('refresh-token');
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
  expect((await DELETE(req('DELETE'))).status).toBe(200);
  expect(prisma.contactMailbox.delete).toHaveBeenCalledWith({ where: { id: 'institution' } });
});
