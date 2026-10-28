/**
 * @jest-environment node
 */

import { POST as forgot } from '../../src/app/api/account/password/forgot/route';
import { POST as reset } from '../../src/app/api/account/password/reset/route';
import prisma from '../../src/lib/prisma/client';
import { verifyPassword } from '../../src/lib/auth/password';
import { hashResetToken } from '../../src/lib/auth/password-reset';
import { USER_SESSION_COOKIE } from '../../src/lib/auth/session';
import { sendPasswordResetEmail } from '../../src/services/mail/sendPasswordResetEmail';

jest.mock('../../src/lib/prisma/client', () => {
  const db = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    passwordResetToken: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
    // Lote (forgot) o transaccion interactiva (reset) sobre el mismo mock.
    $transaction: jest.fn(),
  };
  return { __esModule: true, default: db };
});

jest.mock('../../src/services/mail/sendPasswordResetEmail', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

const NEW_PASSWORD = 'nueva-contraseña-segura';
const env = process.env as Record<string, string | undefined>;
const ENV_KEYS = ['NEXT_PUBLIC_APP_URL', 'VERCEL_URL', 'NODE_ENV'];
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, env[key]]));

let ipCounter = 0;
function jsonRequest(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.1.0.${++ipCounter}`, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const user = { id: 'user-1', name: 'Ana López', email: 'ana@test.com', role: 'USER' };

describe('API /api/account/password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    env.NEXT_PUBLIC_APP_URL = 'https://maestrovirtual.test';
    delete env.VERCEL_URL;
    jest.spyOn(console, 'error').mockImplementation(() => {});

    (prisma.$transaction as jest.Mock).mockImplementation((arg) =>
      typeof arg === 'function' ? arg(prisma) : Promise.all(arg)
    );
    (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue({ id: 'token-1' });
    (prisma.passwordResetToken.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.passwordResetToken.delete as jest.Mock).mockResolvedValue({ id: 'token-1' });
    (sendPasswordResetEmail as jest.Mock).mockResolvedValue({ data: { id: 'email-1' }, error: null });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete env[key];
      else env[key] = originalEnv[key];
    }
  });

  // ==========================================
  // POST /api/account/password/forgot
  // ==========================================
  describe('POST /api/account/password/forgot', () => {
    test('Debe retornar 400 si el correo no es valido', async () => {
      const response = await forgot(jsonRequest('/api/account/password/forgot', { email: 'sin-arroba' }));

      expect(response.status).toBe(400);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('Debe responder lo mismo sin mandar correo si el correo no tiene cuenta', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await forgot(jsonRequest('/api/account/password/forgot', { email: 'nadie@test.com' }));

      expect(response.status).toBe(200);
      expect((await response.json()).ok).toBe(true);
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('Debe responder lo mismo sin mandar correo si la cuenta es de staff', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...user, role: 'STAFF' });

      const response = await forgot(jsonRequest('/api/account/password/forgot', { email: 'staff@test.com' }));

      expect(response.status).toBe(200);
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('No debe mandar otro enlace si se pidio uno hace menos de un minuto', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue({ id: 'token-0' });

      const response = await forgot(jsonRequest('/api/account/password/forgot', { email: user.email }));

      expect(response.status).toBe(200);
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('Debe guardar solo el hash del token y mandar el enlace con NEXT_PUBLIC_APP_URL', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await forgot(
        jsonRequest('/api/account/password/forgot', { email: ' Ana@Test.com ', locale: 'en' }, { host: 'atacante.test' })
      );

      expect(response.status).toBe(200);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { email: 'ana@test.com' } }));
      expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });

      const email = (sendPasswordResetEmail as jest.Mock).mock.calls[0][0];
      const link = new URL(email.resetUrl);
      expect(link.origin).toBe('https://maestrovirtual.test');
      expect(link.pathname).toBe('/en/reset-password');
      expect(email).toEqual(expect.objectContaining({ id: 'token-1', to: 'ana@test.com', name: 'Ana López' }));

      const { data } = (prisma.passwordResetToken.create as jest.Mock).mock.calls[0][0];
      const token = link.searchParams.get('token')!;
      expect(data.tokenHash).toBe(hashResetToken(token));
      expect(data.tokenHash).not.toBe(token);
      expect(data.expiresAt.getTime()).toBeGreaterThan(Date.now() + 59 * 60 * 1000);
    });

    test('Debe retornar 502 y borrar el token si el correo no se pudo enviar', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue({ data: null, error: { message: 'fallo' } });

      const response = await forgot(jsonRequest('/api/account/password/forgot', { email: user.email }));

      expect(response.status).toBe(502);
      expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({ where: { id: 'token-1' } });
    });

    test('En produccion debe retornar 503 si no hay URL configurada (nunca usa el Host)', async () => {
      delete env.NEXT_PUBLIC_APP_URL;
      env.NODE_ENV = 'production';
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const response = await forgot(jsonRequest('/api/account/password/forgot', { email: user.email }));

      expect(response.status).toBe(503);
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // POST /api/account/password/reset
  // ==========================================
  describe('POST /api/account/password/reset', () => {
    const validRecord = () => ({
      id: 'token-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      usedAt: null,
      user: { role: 'USER' },
    });

    test('Debe retornar 400 si falta el token', async () => {
      const response = await reset(jsonRequest('/api/account/password/reset', { password: NEW_PASSWORD }));

      expect(response.status).toBe(400);
      expect(prisma.passwordResetToken.findUnique).not.toHaveBeenCalled();
    });

    test('Debe retornar 400 si la contraseña nueva es corta', async () => {
      const response = await reset(jsonRequest('/api/account/password/reset', { token: 'abc', password: 'corta' }));

      expect(response.status).toBe(400);
      expect(prisma.passwordResetToken.findUnique).not.toHaveBeenCalled();
    });

    test.each([
      ['no existe', null],
      ['ya se uso', { ...validRecord(), usedAt: new Date() }],
      ['ya expiro', { ...validRecord(), expiresAt: new Date(Date.now() - 1000) }],
      ['es de una cuenta de staff', { ...validRecord(), user: { role: 'STAFF' } }],
    ])('Debe retornar 400 sin cambiar nada si el token %s', async (_case, record) => {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(record);

      const response = await reset(jsonRequest('/api/account/password/reset', { token: 'abc', password: NEW_PASSWORD }));

      expect(response.status).toBe(400);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    test('Debe buscar el token por su hash, cambiar la contraseña e invalidar sesiones', async () => {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(validRecord());
      (prisma.passwordResetToken.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await reset(jsonRequest('/api/account/password/reset', { token: 'token-del-correo', password: NEW_PASSWORD }));

      expect(response.status).toBe(200);
      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tokenHash: hashResetToken('token-del-correo') } })
      );
      expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ id: 'token-1', usedAt: null }) })
      );

      const { where, data } = (prisma.user.update as jest.Mock).mock.calls[0][0];
      expect(where).toEqual({ id: 'user-1' });
      expect(await verifyPassword(NEW_PASSWORD, data.hashedPassword)).toBe(true);
      expect(data.passwordChangedAt).toBeInstanceOf(Date);

      expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', id: { not: 'token-1' } },
      });
      const cookie = response.headers.getSetCookie().find((c) => c.startsWith(`${USER_SESSION_COOKIE}=`));
      expect(cookie).toMatch(/Max-Age=0/);
    });

    test('Debe retornar 400 si otra peticion uso el mismo enlace al mismo tiempo', async () => {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(validRecord());
      (prisma.passwordResetToken.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await reset(jsonRequest('/api/account/password/reset', { token: 'abc', password: NEW_PASSWORD }));

      expect(response.status).toBe(400);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
