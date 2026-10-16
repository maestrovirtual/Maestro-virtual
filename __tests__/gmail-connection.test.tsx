import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GmailConnection from '@/features/admin/components/GmailConnection';
const fetchMock = jest.fn();
const onSynced = jest.fn();
const status = { provider: 'gmail', account: 'institution@gmail.com', configured: true, connected: true, mailbox: { email: 'institution@gmail.com', lastSyncedAt: null, lastError: null } };
beforeEach(() => { jest.clearAllMocks(); fetchMock.mockReset(); global.fetch = fetchMock; });
test('explains OAuth setup and disables connection until credentials exist', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ...status, configured: false, connected: false, mailbox: null }) });
  render(<GmailConnection paused={false} onSynced={onSynced} />);
  await screen.findByText('institution@gmail.com');
  expect(screen.getByRole('button', { name: 'Conectar Gmail' })).toBeDisabled();
  expect(screen.getByText(/Falta preparar la conexión de Google/)).toBeVisible();
});
test('syncs the mailbox and refreshes the conversation list after importing', async () => {
  fetchMock.mockImplementation(async (_url, options) => ({ ok: true, json: async () => options?.method === 'POST' ? { imported: 1, more: false } : status }));
  render(<GmailConnection paused={false} onSynced={onSynced} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Sincronizar correo' }));
  await screen.findByText('1 respuesta(s) recibida(s) en el panel.');
  expect(onSynced).toHaveBeenCalled();
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/mailbox/gmail', expect.objectContaining({ method: 'POST', body: '{}' }));
});
test('does not disconnect without the staff confirmation', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => status });
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  render(<GmailConnection paused={false} onSynced={onSynced} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Desconectar' }));
  expect(fetchMock.mock.calls.some(call => call[1]?.method === 'DELETE')).toBe(false);
  confirm.mockRestore();
});
