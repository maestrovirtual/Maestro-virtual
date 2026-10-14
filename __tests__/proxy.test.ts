/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import proxy from '../src/proxy';
import prisma from '../src/lib/prisma/client';
import { createSessionToken, SESSION_COOKIE } from '../src/lib/auth/session';

const mockIntlMiddleware = jest.fn();

jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: () => (request: unknown) => mockIntlMiddleware(request),
}));

jest.mock('../src/lib/prisma/client', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const originalSecret = process.env.AUTH_SECRET;
const INTL_RESPONSE = new Response('intl');
const STAFF_USER = { id: 'staff-1', name: 'Ana', email: 'ana@test.com', role: 'STAFF' };

function request(path: string, token?: string) {
  const req = new NextRequest(`http://localhost:3000${path}`);
  if (token) req.cookies.set(SESSION_COOKIE, token);
  return req;
}

function staffToken() {
  return createSessionToken({ userId: 'staff-1', role: 'STAFF' });
}

describe('proxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_SECRET = 'secreto-de-prueba-con-mas-de-32-caracteres';
    mockIntlMiddleware.mockReturnValue(INTL_RESPONSE);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(STAFF_USER);
  });

  afterAll(() => {
    process.env.AUTH_SECRET = originalSecret;
  });

  describe('rutas del panel admin', () => {
    test.each([
      ['/es/admin', '/es/staff/login'],
      ['/es/admin/', '/es/staff/login'],
      ['/es/admin/cursos', '/es/staff/login'],
      ['/en/admin/courses', '/en/staff/login'],
      ['/ES/Admin', '/es/staff/login'],
      ['/es/%61dmin', '/es/staff/login'],
      ['/%65s/admin', '/es/staff/login'],
      ['/fr/admin', '/es/staff/login'],
    ])('Debe redirigir %s al login %s si no hay sesion', async (path, login) => {
      const response = await proxy(request(path));

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(`http://localhost:3000${login}`);
      expect(mockIntlMiddleware).not.toHaveBeenCalled();
    });

    test('Debe redirigir al login si la sesion es de un usuario sin rol staff', async () => {
      const token = await createSessionToken({ userId: 'user-1', role: 'USER' });

      const response = await proxy(request('/es/admin', token));

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/es/staff/login');
    });

    test('Debe redirigir al login si la cookie fue alterada', async () => {
      const response = await proxy(request('/es/admin', 'cookie.falsificada.firma'));

      expect(response.status).toBe(307);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('Debe redirigir al login si al staff le quitaron el rol en la base de datos', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...STAFF_USER, role: 'USER' });

      const response = await proxy(request('/es/admin', await staffToken()));

      expect(response.status).toBe(307);
    });

    test('Debe redirigir al login si el usuario de la sesion ya no existe', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await proxy(request('/es/admin', await staffToken()));

      expect(response.status).toBe(307);
    });

    test('Debe dejar pasar a un staff con sesion valida', async () => {
      const response = await proxy(request('/es/admin/cursos', await staffToken()));

      expect(response).toBe(INTL_RESPONSE);
      expect(mockIntlMiddleware).toHaveBeenCalledTimes(1);
    });
  });

  describe('rutas publicas', () => {
    test.each(['/', '/es', '/en/courses', '/es/staff/login', '/es/administracion'])(
      'Debe pasar %s a next-intl sin pedir sesion',
      async (path) => {
        const response = await proxy(request(path));

        expect(response).toBe(INTL_RESPONSE);
        expect(mockIntlMiddleware).toHaveBeenCalledTimes(1);
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
      }
    );

    test.each(['/admin', '/fr/courses'])(
      'Debe dejar %s igual que antes (sin next-intl ni sesion)',
      async (path) => {
        const response = await proxy(request(path));

        expect(response.headers.get('x-middleware-next')).toBe('1');
        expect(mockIntlMiddleware).not.toHaveBeenCalled();
      }
    );
  });
});
