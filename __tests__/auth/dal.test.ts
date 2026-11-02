/**
 * @jest-environment node
 */

import { cookies } from 'next/headers';
import prisma from '../../src/lib/prisma/client';
import { getStaffUser, requireStaffApi } from '../../src/lib/auth/dal';
import { createSessionToken, SESSION_COOKIE } from '../../src/lib/auth/session';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('../../src/lib/prisma/client', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const originalSecret = process.env.AUTH_SECRET;

function withSessionCookie(token?: string) {
  (cookies as jest.Mock).mockResolvedValue({
    get: (name: string) => (name === SESSION_COOKIE && token ? { value: token } : undefined),
  });
}

describe('lib/auth/dal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_SECRET = 'secreto-de-prueba-con-mas-de-32-caracteres';
  });

  afterAll(() => {
    process.env.AUTH_SECRET = originalSecret;
  });

  describe('requireStaffApi', () => {
    test('Debe responder 401 si no hay cookie de sesion', async () => {
      withSessionCookie();

      const response = await requireStaffApi();

      expect(response?.status).toBe(401);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('Debe responder 401 si la cookie es invalida', async () => {
      withSessionCookie('token-falso');

      expect((await requireStaffApi())?.status).toBe(401);
    });

    test('Debe responder 403 si la sesion es de un usuario sin rol staff', async () => {
      withSessionCookie(await createSessionToken({ userId: 'user-1', role: 'USER' }));

      expect((await requireStaffApi())?.status).toBe(403);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('Debe responder 401 si el usuario de la sesion ya no existe', async () => {
      withSessionCookie(await createSessionToken({ userId: 'user-1', role: 'STAFF' }));
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      expect((await requireStaffApi())?.status).toBe(401);
    });

    test('Debe responder 403 si al usuario le quitaron el rol staff', async () => {
      withSessionCookie(await createSessionToken({ userId: 'user-1', role: 'STAFF' }));
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1', name: 'Ana', email: 'ana@test.com', role: 'USER',
      });

      expect((await requireStaffApi())?.status).toBe(403);
    });

    test('Debe devolver null si el usuario es staff', async () => {
      withSessionCookie(await createSessionToken({ userId: 'user-1', role: 'STAFF' }));
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1', name: 'Ana', email: 'ana@test.com', role: 'STAFF',
      });

      expect(await requireStaffApi()).toBeNull();
    });
  });

  describe('getStaffUser', () => {
    test('Debe devolver null si no hay sesion', async () => {
      withSessionCookie();

      expect(await getStaffUser()).toBeNull();
    });

    test('Debe devolver los datos del staff sin exponer el rol ni la contraseña', async () => {
      withSessionCookie(await createSessionToken({ userId: 'user-1', role: 'STAFF' }));
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1', name: 'Ana', email: 'ana@test.com', role: 'STAFF',
      });

      expect(await getStaffUser()).toEqual({ id: 'user-1', name: 'Ana', email: 'ana@test.com' });
    });
  });
});
