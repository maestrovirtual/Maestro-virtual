/**
 * @jest-environment node
 */

import { cookies } from 'next/headers';
import prisma from '../../src/lib/prisma/client';
import { getCurrentUser } from '../../src/lib/auth/dal';
import { checkUserToken } from '../../src/lib/auth/user';
import { createSessionToken, SESSION_COOKIE, USER_SESSION_COOKIE } from '../../src/lib/auth/session';

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
const dbUser = {
  id: 'user-1', name: 'Ana López', email: 'ana@test.com', role: 'USER', passwordChangedAt: null,
};

describe('lib/auth/user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_SECRET = 'secreto-de-prueba-con-mas-de-32-caracteres';
  });

  afterAll(() => {
    process.env.AUTH_SECRET = originalSecret;
  });

  describe('checkUserToken', () => {
    test('Debe retornar null sin token o con un token invalido', async () => {
      expect(await checkUserToken(undefined)).toBeNull();
      expect(await checkUserToken('token-falso')).toBeNull();
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('Debe rechazar un token de staff sin consultar la base de datos', async () => {
      const token = await createSessionToken({ userId: 'staff-1', role: 'STAFF' });

      expect(await checkUserToken(token)).toBeNull();
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('Debe retornar al usuario si el token y la cuenta son validos', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(dbUser);
      const token = await createSessionToken({ userId: 'user-1', role: 'USER' });

      expect(await checkUserToken(token)).toEqual({ id: 'user-1', name: 'Ana López', email: 'ana@test.com' });
    });

    test('Debe retornar null si la cuenta ya no existe o ya no es USER', async () => {
      const token = await createSessionToken({ userId: 'user-1', role: 'USER' });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      expect(await checkUserToken(token)).toBeNull();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...dbUser, role: 'STAFF' });
      expect(await checkUserToken(token)).toBeNull();
    });

    test('Debe rechazar sesiones emitidas antes del ultimo cambio de contraseña', async () => {
      const token = await createSessionToken({ userId: 'user-1', role: 'USER' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...dbUser, passwordChangedAt: new Date(Date.now() + 5000),
      });

      expect(await checkUserToken(token)).toBeNull();
    });

    test('Debe aceptar sesiones emitidas despues del cambio de contraseña', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...dbUser, passwordChangedAt: new Date(),
      });
      const token = await createSessionToken({ userId: 'user-1', role: 'USER' });

      expect(await checkUserToken(token)).not.toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    function withCookies(values: Record<string, string>) {
      (cookies as jest.Mock).mockResolvedValue({
        get: (name: string) => (values[name] ? { value: values[name] } : undefined),
      });
    }

    test('Debe leer la cookie de usuario', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(dbUser);
      withCookies({ [USER_SESSION_COOKIE]: await createSessionToken({ userId: 'user-1', role: 'USER' }) });

      expect(await getCurrentUser()).toEqual(expect.objectContaining({ id: 'user-1' }));
    });

    test('No debe aceptar un token de usuario puesto en la cookie de staff', async () => {
      withCookies({ [SESSION_COOKIE]: await createSessionToken({ userId: 'user-1', role: 'USER' }) });

      expect(await getCurrentUser()).toBeNull();
    });
  });
});
