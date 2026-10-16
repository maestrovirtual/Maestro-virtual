/** @jest-environment node */
import { contactMailSettings } from '@/lib/mail/contact-settings';
import { sendContactReply } from '@/services/mail/sendContactReply';
import { getResend } from '@/lib/mail/resend';
jest.mock('@/lib/mail/resend', () => ({ getResend: jest.fn() }));
const original = process.env;
beforeEach(() => { process.env = { ...original, RESEND_API_KEY: 'private-key', MAIL_FROM: 'Maestro Virtual <contacto@example.org>', CONTACT_EMAIL: 'buzon@example.org', MAIL_REPLY_TO: '' }; });
afterEach(() => { process.env = original; jest.clearAllMocks(); });
test('separates sender from institutional reply mailbox and never exposes the key', () => {
  expect(contactMailSettings()).toEqual({ ready: true, from: 'Maestro Virtual <contacto@example.org>', replyTo: 'buzon@example.org', issues: [] });
  expect(JSON.stringify(contactMailSettings())).not.toContain('private-key');
});
test('supports a dedicated reply mailbox', () => {
  process.env.MAIL_REPLY_TO = 'support@example.org';
  expect(contactMailSettings().replyTo).toBe('support@example.org');
});
test.each(['', 'invalid', 'Name <contacto@example.org>\r\nBcc: attacker@example.org', 'onboarding@resend.dev'])('rejects invalid or testing sender: %s', from => {
  process.env.MAIL_FROM = from;
  expect(contactMailSettings().ready).toBe(false);
});
test('missing API key prevents configured status', () => {
  delete process.env.RESEND_API_KEY;
  expect(contactMailSettings().ready).toBe(false);
});
test('sends plain text with a stable idempotency key and institutional identities', async () => {
  const send = jest.fn().mockResolvedValue({ data: { id: 'sent' }, error: null });
  (getResend as jest.Mock).mockReturnValue({ emails: { send } });
  const reply = { id: 'request-id', fromEmail: 'contacto@example.org', toEmail: 'visitor@example.net', replyTo: 'buzon@example.org', subject: 'Re: Consulta', body: '<script>Plain text</script>' };
  await sendContactReply(reply);
  expect(send).toHaveBeenCalledWith({ from: reply.fromEmail, to: reply.toEmail, replyTo: reply.replyTo, subject: reply.subject, text: reply.body }, { idempotencyKey: 'contact-reply/request-id' });
});
