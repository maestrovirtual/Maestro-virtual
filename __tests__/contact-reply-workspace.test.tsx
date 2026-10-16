import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactReplyWorkspace from '@/features/admin/components/ContactReplyWorkspace';
jest.mock('next-intl', () => ({ useLocale: () => 'es' }));
const message = { id: 'contact-1', name: 'Ana López', email: 'ana@example.net', subject: 'Información de cursos', isSpam: false };
const mail = { ready: true, from: 'Maestro Virtual <contacto@example.org>', replyTo: 'contacto@example.org', issues: [] as string[] };
const reply = { id: 'c8f48730-bd80-4910-a7a4-95053ab10276', staffId: 'staff-1', staffName: 'Brandon', fromEmail: mail.from, toEmail: message.email, replyTo: mail.replyTo, subject: 'Re: Información de cursos', body: 'Hola Ana, nuestros cursos están disponibles.', status: 'SENT', createdAt: '2026-10-16T07:00:00Z', sentAt: '2026-10-16T07:00:00Z', error: null, canRetry: true };
const history = (replies: Array<Omit<typeof reply, 'sentAt'> & { sentAt: string | null }> = [], config = mail) => ({ ok: true, json: async () => ({ replies, total: replies.length, hasPending: replies.some(item => item.status === 'PENDING'), page: 1, pageSize: 20, staffId: 'staff-1', mail: config }) });
const fetchMock = jest.fn();
const onSent = jest.fn();
const onBusyChange = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  global.fetch = fetchMock;
  fetchMock.mockResolvedValue(history());
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: () => reply.id });
});
function open(isSpam = false) {
  render(<ContactReplyWorkspace message={{ ...message, isSpam }} onSent={onSent} onBusyChange={onBusyChange} />);
  fireEvent.click(screen.getByRole('button', { name: /Responder desde el panel/ }));
}
test('displays institutional sender, editable draft, preview, and external mail option', async () => {
  open();
  expect(await screen.findByText(mail.from)).toBeVisible();
  const external = screen.getByRole('link', { name: /Abrir en mi app de correo/ });
  expect(external).toHaveAttribute('href', `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(reply.subject)}`);
  fireEvent.change(screen.getByLabelText('Tu respuesta'), { target: { value: reply.body } });
  fireEvent.click(screen.getByRole('button', { name: 'Vista previa' }));
  expect(screen.getByText(reply.body)).toBeVisible();
});
test('blocks unconfigured sending while allowing composing and using external mail', async () => {
  fetchMock.mockResolvedValueOnce(history([], { ...mail, ready: false, issues: ['Falta configurar RESEND_API_KEY.', 'Falta MAIL_FROM.'] }));
  open();
  await screen.findByText('El envío institucional aún no está configurado');
  expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeDisabled();
  expect(screen.getByLabelText('Tu respuesta')).toBeEnabled();
  expect(screen.getByRole('link', { name: /Abrir en mi app/ })).toBeVisible();
  expect(onSent).not.toHaveBeenCalled();
});
test('confirms only server accepted sending and shows the saved reply in history', async () => {
  open();
  await screen.findByText(mail.from);
  fireEvent.change(screen.getByLabelText('Tu respuesta'), { target: { value: reply.body } });
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ reply }) });
  fetchMock.mockResolvedValueOnce(history([reply]));
  fireEvent.click(screen.getByRole('button', { name: 'Enviar respuesta' }));
  await screen.findByText('Enviado');
  expect(onSent).toHaveBeenCalledTimes(1);
  expect(onBusyChange).toHaveBeenLastCalledWith(false);
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/messages/contact-1/replies', expect.objectContaining({ method: 'POST', body: JSON.stringify({ requestId: reply.id, subject: reply.subject, body: reply.body }) }));
  expect(screen.getByLabelText('Tu respuesta')).toHaveValue('');
});
test('preserves response and reuses the same attempt ID after a network failure', async () => {
  open();
  await screen.findByText(mail.from);
  fireEvent.change(screen.getByLabelText('Tu respuesta'), { target: { value: reply.body } });
  fetchMock.mockRejectedValueOnce(new Error('Conexión interrumpida'));
  fetchMock.mockResolvedValueOnce(history([{ ...reply, status: 'PENDING', sentAt: null }]));
  fireEvent.click(screen.getByRole('button', { name: 'Enviar respuesta' }));
  await screen.findByRole('alert');
  expect(onSent).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Tu respuesta')).toHaveValue(reply.body);
  const retry = await screen.findByRole('button', { name: 'Reintentar mismo envío' });
  await waitFor(() => expect(retry).toBeEnabled());
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ reply }) });
  fetchMock.mockResolvedValueOnce(history([reply]));
  fireEvent.click(retry);
  await screen.findByText('Enviado');
  const posts = fetchMock.mock.calls.filter(call => call[1]?.method === 'POST');
  expect(posts).toHaveLength(2);
  expect(posts[0][1].body).toBe(posts[1][1].body);
});
test('requires restoring spam before responding', async () => {
  open(true);
  await screen.findByText(mail.from);
  expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeDisabled();
  expect(screen.getByText(/antes de responder desde el panel/)).toBeVisible();
});
test('a pending attempt outside the visible history page still blocks new sending', async () => {
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ replies: [], total: 21, hasPending: true, page: 2, pageSize: 20, staffId: 'staff-1', mail }) });
  open();
  await screen.findByText(mail.from);
  expect(screen.getByRole('button', { name: 'Enviar respuesta' })).toBeDisabled();
  expect(screen.getByText(/Hay un envío por confirmar/)).toBeVisible();
});
