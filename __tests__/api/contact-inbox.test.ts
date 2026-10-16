/** @jest-environment node */
import { NextResponse } from 'next/server';
import { GET } from '@/app/api/admin/messages/route';
import { PATCH } from '@/app/api/admin/messages/[id]/route';
import prisma from '@/lib/prisma/client';
import { requireStaffApi } from '@/lib/auth/dal';

jest.mock('@/lib/auth/dal', () => ({ requireStaffApi: jest.fn() }));
jest.mock('@/lib/prisma/client', () => ({ __esModule: true, default: {
  contactMessage: { findMany: jest.fn(), count: jest.fn(), updateMany: jest.fn() },
  $transaction: jest.fn(),
} }));
const context = { params: Promise.resolve({ id: 'message-1' }) };
const request = (body: unknown) => new Request('http://localhost/api/admin/messages/message-1', {
  method: 'PATCH', body: JSON.stringify(body),
});
beforeEach(() => {
  jest.clearAllMocks();
  process.env.MAIL_PROVIDER = "resend";
  (requireStaffApi as jest.Mock).mockResolvedValue(null);
});
test.each([401, 403])('blocks unauthorized reads and writes (%s)', async status => {
  (requireStaffApi as jest.Mock).mockResolvedValue(NextResponse.json({ error: 'Denied' }, { status }));
  expect((await GET(new Request('http://localhost/api/admin/messages'))).status).toBe(status);
  expect((await PATCH(request({ isRead: true }), context)).status).toBe(status);
  expect(prisma.contactMessage.findMany).not.toHaveBeenCalled();
  expect(prisma.contactMessage.updateMany).not.toHaveBeenCalled();
});
test('lists newest first with deterministic order and pagination', async () => {
  (prisma.$transaction as jest.Mock).mockResolvedValue([[{ id: 'message-1', isRead: false }], 21, 7, 2, 3]);
  const response = await GET(new Request('http://localhost/api/admin/messages?page=2'));
  expect(await response.json()).toEqual({ messages: [{ id: 'message-1', isRead: false }], total: 21, page: 2, pageSize: 20, mailProvider: "resend", unreadCounts: { inbox: 7, archived: 2, spam: 3 } });
  expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({ where: { isArchived: false, isSpam: false }, include: { _count: { select: { replies: { where: { status: "SENT", direction: "OUTBOUND" } } } } }, orderBy: [{ lastActivityAt: 'desc' }, { id: 'desc' }], skip: 20, take: 20 });
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});
test.each(['0', '-1', '1.5', 'abc', '100001'])('rejects invalid page %s', async page => {
  expect((await GET(new Request(`http://localhost/api/admin/messages?page=${page}`))).status).toBe(400);
});
test.each([true, false])('persists read state %s', async isRead => {
  (prisma.contactMessage.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  const response = await PATCH(request({ isRead }), context);
  expect(await response.json()).toEqual({ id: 'message-1', isRead });
  expect(prisma.contactMessage.updateMany).toHaveBeenCalledWith({ where: { id: 'message-1' }, data: { isRead } });
});
test.each([null, {}, { isRead: 'true' }])('rejects invalid state %j', async body => {
  expect((await PATCH(request(body), context)).status).toBe(400);
  expect(prisma.contactMessage.updateMany).not.toHaveBeenCalled();
});
test('returns 404 for a missing message', async () => {
  (prisma.contactMessage.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
  expect((await PATCH(request({ isRead: true }), context)).status).toBe(404);
});
test('returns a recoverable error for a database outage', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('offline'));
  expect((await GET(new Request('http://localhost/api/admin/messages'))).status).toBe(500);
  log.mockRestore();
});

 test('filters archived messages and counts only that folder', async () => {
  (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0, 0, 0, 0]);
  expect((await GET(new Request('http://localhost/api/admin/messages?view=archived'))).status).toBe(200);
  expect(prisma.contactMessage.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isArchived: true, isSpam: false } }));
  expect(prisma.contactMessage.count).toHaveBeenCalledWith({ where: { isArchived: true, isSpam: false } });
});
test('rejects unknown folders', async () => {
  expect((await GET(new Request('http://localhost/api/admin/messages?view=trash'))).status).toBe(400);
  expect(prisma.contactMessage.findMany).not.toHaveBeenCalled();
});
test.each([true, false])('persists archive state %s without changing read state', async isArchived => {
  (prisma.contactMessage.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  const response = await PATCH(request({ isArchived }), context);
  const data = isArchived ? { isArchived, isSpam: false } : { isArchived };
  expect(await response.json()).toEqual({ id: 'message-1', ...data });
  expect(prisma.contactMessage.updateMany).toHaveBeenCalledWith({ where: { id: 'message-1' }, data });
});
test.each([{ isArchived: 'true' }, { isArchived: null }, { isArchived: true, message: 'overwrite' }, []])('rejects invalid archive updates %j', async body => {
  expect((await PATCH(request(body), context)).status).toBe(400);
  expect(prisma.contactMessage.updateMany).not.toHaveBeenCalled();
});
test.each([401, 403])('blocks unauthorized archival (%s)', async status => {
  (requireStaffApi as jest.Mock).mockResolvedValue(NextResponse.json({ error: 'Denied' }, { status }));
  expect((await PATCH(request({ isArchived: true }), context)).status).toBe(status);
  expect(prisma.contactMessage.updateMany).not.toHaveBeenCalled();
});

test('spam is separated from both inbox and archived folders', async () => {
  (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0, 0, 0, 0]);
  expect((await GET(new Request('http://localhost/api/admin/messages?view=spam'))).status).toBe(200);
  expect(prisma.contactMessage.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isSpam: true, isArchived: false }, take: 20 }));
  expect(prisma.contactMessage.count).toHaveBeenCalledWith({ where: { isSpam: true, isArchived: false } });
});
test.each([true, false])('persists spam status %s', async isSpam => {
  (prisma.contactMessage.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  const response = await PATCH(request({ isSpam }), context);
  const data = isSpam ? { isSpam, isArchived: false } : { isSpam };
  expect(await response.json()).toEqual({ id: 'message-1', ...data });
  expect(prisma.contactMessage.updateMany).toHaveBeenCalledWith({ where: { id: 'message-1' }, data });
});
test.each([{ isSpam: 'true' }, { isSpam: true, isArchived: true }])('rejects invalid spam or conflicting folders %j', async body => {
  expect((await PATCH(request(body), context)).status).toBe(400);
  expect(prisma.contactMessage.updateMany).not.toHaveBeenCalled();
});
test.each([401, 403])('blocks unauthorized spam updates (%s)', async status => {
  (requireStaffApi as jest.Mock).mockResolvedValue(NextResponse.json({ error: 'Denied' }, { status }));
  expect((await PATCH(request({ isSpam: true }), context)).status).toBe(status);
  expect(prisma.contactMessage.updateMany).not.toHaveBeenCalled();
});

test('counts unread messages across all pages of each folder', async () => {
  (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0, 23, 4, 8]);
  const response = await GET(new Request('http://localhost/api/admin/messages?view=spam&page=2'));
  expect((await response.json()).unreadCounts).toEqual({ inbox: 23, archived: 4, spam: 8 });
  for (const where of [
    { isRead: false, isArchived: false, isSpam: false },
    { isRead: false, isArchived: true, isSpam: false },
    { isRead: false, isArchived: false, isSpam: true },
  ]) expect(prisma.contactMessage.count).toHaveBeenCalledWith({ where });
});
