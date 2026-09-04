/**
 * @jest-environment node
 */

import { GET, POST } from '../../src/app/api/events/route';
import prisma from '../../src/lib/prisma/client';

// Mock de Prisma para Eventos
jest.mock(
  '../../src/lib/prisma/client',
  () => ({
    __esModule: true,
    default: {
      event: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    },
  }),
  { virtual: true }
);

describe('API /api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================
  // GET
  // ==========================================
  describe('GET /api/events', () => {
    test('Debe retornar status 200 y la lista de eventos ordenados', async () => {
      const mockEvents = [{ id: '1', title: 'Taller de Next.js' }];
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockEvents);
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { date: 'asc' },
      });
    });

    test('Debe retornar status 500 si falla la base de datos', async () => {
      (prisma.event.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Error interno al obtener los eventos' });
    });
  });

  // ==========================================
  // POST
  // ==========================================
  describe('POST /api/events', () => {
    test('Debe retornar 400 si falta el título, la fecha o la modalidad', async () => {
      const req = new Request('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({ title: 'Evento sin fecha ni modalidad' }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'El título, la fecha y la modalidad son obligatorios',
      });
    });

    test('Debe crear un evento exitosamente con status 201', async () => {
      const eventPayload = {
        title: 'Hackathon 2026',
        date: '2026-10-10',
        modality: 'online',
      };
      const createdMock = { id: '200', ...eventPayload };

      (prisma.event.create as jest.Mock).mockResolvedValue(createdMock);

      const req = new Request('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify(eventPayload),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMock);
    });

    test('Debe retornar status 500 si falla al crear en la base de datos', async () => {
      (prisma.event.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const req = new Request('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Evento Válido',
          date: '2026-10-10',
          modality: 'presencial',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Error interno al crear el evento' });
    });
  });
});