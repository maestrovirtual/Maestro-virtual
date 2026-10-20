import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminMessagesView from '@/features/admin/components/AdminMessagesView';
jest.mock('next-intl', () => ({ useLocale: () => 'es' }));
const message = { id: 'one', name: 'Ana', email: 'ana@example.com', subject: 'Consulta', message: 'Información sobre cursos', isRead: false, isArchived: false, isSpam: false, date: '2026-10-14T12:00:00Z' };
const fetchMock = jest.fn();
beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ messages: [message], total: 1, page: 1, pageSize: 20 }) });
});
test('opens content and updates read state after server confirmation', async () => {
  render(<AdminMessagesView />);
  expect(screen.getByRole('status')).toHaveTextContent('Cargando');
  await screen.findByText('No leído');
  fireEvent.click(screen.getByText('Ver mensaje'));
  expect(screen.getByText(message.message)).toBeVisible();
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ isRead: true }) });
  fireEvent.click(screen.getByText('Marcar como leído'));
  await screen.findByText('Leído');
  expect(fetchMock).toHaveBeenLastCalledWith('/api/admin/messages/one', expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ isRead: true }) }));
});
test('preserves unread status when saving fails', async () => {
  render(<AdminMessagesView />);
  await screen.findByText('No leído');
  fetchMock.mockResolvedValueOnce({ ok: false });
  fireEvent.click(screen.getByText('Marcar como leído'));
  await screen.findByRole('alert');
  expect(screen.getByText('No leído')).toBeVisible();
});
test('supports empty inbox and retry after load failure', async () => {
  fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });
  render(<AdminMessagesView />);
  await screen.findByRole('alert');
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [], total: 0, page: 1, pageSize: 20 }) });
  fireEvent.click(screen.getByText('Reintentar'));
  await waitFor(() => expect(screen.getByText('Todo listo para tu primer mensaje')).toBeVisible());
});

function inboxResponse(messages: typeof message[], total = messages.length) {
  return { ok: true, json: async () => ({ messages, total, page: 1, pageSize: 20 }) };
}
test('archives only after confirmation and allows restoring from archived folder', async () => {
  render(<AdminMessagesView />);
  await screen.findByText('Consulta');
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'one', isArchived: true }) });
  fetchMock.mockResolvedValueOnce(inboxResponse([]));
  fireEvent.click(screen.getByRole('button', { name: 'Archivar' }));
  await screen.findByText('Todo listo para tu primer mensaje');
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/messages/one', expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ isArchived: true }) }));
  fetchMock.mockResolvedValueOnce(inboxResponse([{ ...message, isArchived: true }]));
  fireEvent.click(screen.getByRole('button', { name: 'Archivados' }));
  await screen.findByText('Consulta');
  expect(fetchMock).toHaveBeenLastCalledWith('/api/admin/messages?page=1&view=archived', expect.anything());
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'one', isArchived: false }) });
  fetchMock.mockResolvedValueOnce(inboxResponse([]));
  fireEvent.click(screen.getByRole('button', { name: 'Devolver a la bandeja' }));
  await screen.findByText('No tienes mensajes archivados');
  expect(screen.getByRole('status')).toHaveTextContent('Mensaje devuelto');
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/messages/one', expect.objectContaining({ body: JSON.stringify({ isArchived: false }) }));
});
test('keeps the message visible if archive fails', async () => {
  render(<AdminMessagesView />);
  await screen.findByText('Consulta');
  fetchMock.mockResolvedValueOnce({ ok: false });
  fireEvent.click(screen.getByRole('button', { name: 'Archivar' }));
  await screen.findByRole('alert');
  expect(screen.getByText('Consulta')).toBeVisible();
});
test('returns to previous page after archiving its last message', async () => {
  fetchMock.mockResolvedValueOnce(inboxResponse([message], 21));
  render(<AdminMessagesView />);
  await screen.findByText('Consulta');
  fetchMock.mockResolvedValueOnce(inboxResponse([message], 21));
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  await screen.findByText('Página 2 de 2 · 21 mensajes');
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ isArchived: true }) });
  fetchMock.mockResolvedValueOnce(inboxResponse([message], 20));
  fireEvent.click(screen.getByRole('button', { name: 'Archivar' }));
  await screen.findByText('Página 1 de 1 · 20 mensajes');
  expect(fetchMock).toHaveBeenLastCalledWith('/api/admin/messages?page=1&view=inbox', expect.anything());
});

test('moves a message to spam and restores it to the inbox', async () => {
  render(<AdminMessagesView />);
  await screen.findByText('Consulta');
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ isSpam: true, isArchived: false }) });
  fetchMock.mockResolvedValueOnce(inboxResponse([]));
  fireEvent.click(screen.getByRole('button', { name: 'Marcar como spam' }));
  await screen.findByText('Todo listo para tu primer mensaje');
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/messages/one', expect.objectContaining({ body: JSON.stringify({ isSpam: true }) }));
  fetchMock.mockResolvedValueOnce(inboxResponse([{ ...message, isSpam: true }]));
  fireEvent.click(screen.getByRole('button', { name: 'Spam' }));
  await screen.findByText('Consulta');
  expect(fetchMock).toHaveBeenLastCalledWith('/api/admin/messages?page=1&view=spam', expect.anything());
  expect(screen.queryByRole('button', { name: 'Archivar' })).not.toBeInTheDocument();
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ isSpam: false }) });
  fetchMock.mockResolvedValueOnce(inboxResponse([]));
  fireEvent.click(screen.getByRole('button', { name: 'No es spam' }));
  await screen.findByText('Tu carpeta de spam está vacía');
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/messages/one', expect.objectContaining({ body: JSON.stringify({ isSpam: false }) }));
});
test('keeps the message visible if marking as spam fails', async () => {
  render(<AdminMessagesView />);
  await screen.findByText('Consulta');
  fetchMock.mockResolvedValueOnce({ ok: false });
  fireEvent.click(screen.getByRole('button', { name: 'Marcar como spam' }));
  await screen.findByRole('alert');
  expect(screen.getByText('Consulta')).toBeVisible();
});

test('shows global unread badges and decreases the current folder when reading', async () => {
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [message], total: 30, page: 1, pageSize: 20, unreadCounts: { inbox: 23, archived: 2, spam: 3 } }) });
  render(<AdminMessagesView />);
  await screen.findByText('Consulta');
  const folders = screen.getByRole('navigation', { name: 'Carpetas de mensajes' });
  expect(within(folders).getByLabelText('23 sin leer')).toBeVisible();
  expect(within(folders).getByLabelText('2 sin leer')).toBeVisible();
  expect(within(folders).getByLabelText('3 sin leer')).toBeVisible();
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ isRead: true }) });
  fireEvent.click(screen.getByRole('button', { name: 'Marcar como leído' }));
  await screen.findByText('Leído');
  expect(within(folders).getByLabelText('22 sin leer')).toBeVisible();
});
test('refreshes arrivals and unread badges when returning to the window', async () => {
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [], total: 0, page: 1, pageSize: 20, unreadCounts: { inbox: 0, archived: 0, spam: 0 } }) });
  render(<AdminMessagesView />);
  await screen.findByText('Todo listo para tu primer mensaje');
  const folders = screen.getByRole('navigation', { name: 'Carpetas de mensajes' });
  expect(within(folders).queryByLabelText(/sin leer/)).not.toBeInTheDocument();
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [message], total: 1, page: 1, pageSize: 20, unreadCounts: { inbox: 1, archived: 0, spam: 2 } }) });
  fireEvent(window, new Event('focus'));
  await screen.findByText('Consulta');
  expect(within(folders).getByLabelText('1 sin leer')).toBeVisible();
  expect(within(folders).getByLabelText('2 sin leer')).toBeVisible();
});
