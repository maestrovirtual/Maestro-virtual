import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminMessagesView from '@/features/admin/components/AdminMessagesView';
jest.mock('next-intl', () => ({ useLocale: () => 'es' }));
const message = { id: 'one', name: 'Ana', email: 'ana@example.com', subject: 'Consulta', message: 'Información sobre cursos', isRead: false, date: '2026-10-14T12:00:00Z' };
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
  await waitFor(() => expect(screen.getByText('No hay mensajes en esta página.')).toBeVisible());
});
