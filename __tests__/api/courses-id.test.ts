/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server';
import { PUT, DELETE } from '../../src/app/api/courses/[id]/route';
import prisma from '../../src/lib/prisma/client';
import { requireStaffApi } from '../../src/lib/auth/dal';

jest.mock('../../src/lib/prisma/client', () => ({
  __esModule: true,
  default: {
    course: {
      update: jest.fn(),
    },
  },
}));

jest.mock('../../src/lib/auth/dal', () => ({
  __esModule: true,
  requireStaffApi: jest.fn(),
}));

const params = { params: Promise.resolve({ id: 'curso-1' }) };

const calls = {
  PUT: () =>
    PUT(
      new Request('http://localhost:3000/api/courses/curso-1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Titulo editado' }),
      }),
      params
    ),
  DELETE: () =>
    DELETE(new Request('http://localhost:3000/api/courses/curso-1', { method: 'DELETE' }), params),
};

describe('API /api/courses/[id] (solo staff)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.course.update as jest.Mock).mockResolvedValue({ id: 'curso-1' });
  });

  describe.each(['PUT', 'DELETE'] as const)('%s', (method) => {
    test.each([
      [401, 'No autenticado'],
      [403, 'No autorizado'],
    ])('Debe retornar %i sin modificar el curso si quien lo pide no es staff', async (status, error) => {
      (requireStaffApi as jest.Mock).mockResolvedValue(NextResponse.json({ error }, { status }));

      const response = await calls[method]();

      expect(response.status).toBe(status);
      expect(prisma.course.update).not.toHaveBeenCalled();
    });

    test('Debe modificar el curso si quien lo pide es staff', async () => {
      (requireStaffApi as jest.Mock).mockResolvedValue(null);

      const response = await calls[method]();

      expect(response.status).toBe(200);
      expect(prisma.course.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'curso-1' } })
      );
    });
  });
});
