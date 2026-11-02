/**
 * @jest-environment node
 */

import { POST as register } from '../../src/app/api/account/register/route';
import { POST as login } from '../../src/app/api/account/login/route';
import { POST as logout } from '../../src/app/api/account/logout/route';
import prisma from '../../src/lib/prisma/client';
import { hashPassword, verifyPassword } from '../../src/lib/auth/password';
import {
  verifySessionToken,
  SESSION_COOKIE,
  USER_SESSION_COOKIE,
  USER_SESSION_DURATION_SECONDS,
} from '../../src/lib/auth/session';

jest.mock('../../src/lib/prisma/client', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const originalSecret = process.env.AUTH_SECRET;
const PASSWORD = 'contraseña-del-usuario';
let passwordHash: string;

// Cada peticion sale de una IP distinta para no chocar con el limite por IP,
// salvo en las pruebas que lo revisan a proposito.
let ipCounter = 0;
function jsonRequest(path: string, body: unknown, ip = `10.0.0.${++ipCounter}`) {
  return new Request(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function getCookie(response: Response, name: string) {
  return response.headers.getSetCookie().find((cookie) => cookie.startsWith(`${name}=`));
}

function cookieToken(cookie: string) {
  return cookie.split(';')[0].split('=')[1];
}

describe('API /api/account', () => {
  beforeAll(async () => {
    passwordHash = await hashPassword(PASSWORD);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_SECRET = 'secreto-de-prueba-con-mas-de-32-caracteres';
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env.AUTH_SECRET = originalSecret;
  });

  // ==========================================
  // POST /api/account/register
  // ==========================================
  describe('POST /api/account/register', () => {
    const valid = { name: 'Ana López', email: 'ana@test.com', password: PASSWORD };

    test('Debe retornar 400 si el cuerpo no es JSON valido', async () => {
      const response = await register(jsonRequest('/api/account/register', 'no-es-json'));

      expect(response.status).toBe(400);
    });

    test.each([
      ['sin nombre', { ...valid, name: '   ' }],
      ['con nombre demasiado largo', { ...valid, name: 'a'.repeat(121) }],
      ['con correo invalido', { ...valid, email: 'ana-sin-arroba' }],
      ['con contraseña corta', { ...valid, password: 'corta' }],
      ['con contraseña demasiado larga', { ...valid, password: 'a'.repeat(129) }],
    ])('Debe retornar 400 %s sin tocar la base de datos', async (_case, body) => {
      const response = await register(jsonRequest('/api/account/register', body));

      expect(response.status).toBe(400);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    test('Debe retornar 409 si el correo ya tiene cuenta', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' });

      const response = await register(jsonRequest('/api/account/register', valid));

      expect(response.status).toBe(409);
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(getCookie(response, USER_SESSION_COOKIE)).toBeUndefined();
    });

    test('Debe crear un usuario USER con la contraseña hasheada e iniciar su sesion', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({ id: 'user-1' });

      const response = await register(
        jsonRequest('/api/account/register', { ...valid, name: '  Ana López ', email: ' Ana@Test.com ' })
      );

      expect(response.status).toBe(201);

      const { data } = (prisma.user.create as jest.Mock).mock.calls[0][0];
      expect(data).toEqual(
        expect.objectContaining({ name: 'Ana López', email: 'ana@test.com', role: 'USER' })
      );
      expect(data.hashedPassword).not.toContain(PASSWORD);
      expect(await verifyPassword(PASSWORD, data.hashedPassword)).toBe(true);

      const cookie = getCookie(response, USER_SESSION_COOKIE);
      expect(cookie).toMatch(/HttpOnly/i);
      expect(cookie).toMatch(new RegExp(`Max-Age=${USER_SESSION_DURATION_SECONDS}`));
      expect(await verifySessionToken(cookieToken(cookie!))).toEqual({ userId: 'user-1', role: 'USER' });
      expect(getCookie(response, SESSION_COOKIE)).toBeUndefined();
    });

    test('Debe retornar 409 si otro registro con el mismo correo gana la carrera', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockRejectedValue(Object.assign(new Error('Unique'), { code: 'P2002' }));

      const response = await register(jsonRequest('/api/account/register', valid));

      expect(response.status).toBe(409);
    });

    test('Debe retornar 429 despues de 5 registros desde la misma IP', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' });

      for (let attempt = 0; attempt < 5; attempt++) {
        await register(jsonRequest('/api/account/register', valid, '192.168.1.10'));
      }
      const response = await register(jsonRequest('/api/account/register', valid, '192.168.1.10'));

      expect(response.status).toBe(429);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(5);
    });
  });

  // ==========================================
  // POST /api/account/login
  // ==========================================
  describe('POST /api/account/login', () => {
    test('Debe retornar 400 si falta el correo o la contraseña', async () => {
      const response = await login(jsonRequest('/api/account/login', { email: 'ana@test.com' }));

      expect(response.status).toBe(400);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('Debe retornar 401 si el correo no existe', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await login(jsonRequest('/api/account/login', { email: 'nadie@test.com', password: PASSWORD }));

      expect(response.status).toBe(401);
      expect(getCookie(response, USER_SESSION_COOKIE)).toBeUndefined();
    });

    test('Debe retornar 401 si la contraseña es incorrecta', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1', role: 'USER', hashedPassword: passwordHash,
      });

      const response = await login(jsonRequest('/api/account/login', { email: 'ana@test.com', password: 'incorrecta' }));

      expect(response.status).toBe(401);
      expect(getCookie(response, USER_SESSION_COOKIE)).toBeUndefined();
    });

    test('Debe retornar 401 a una cuenta de staff aunque su contraseña sea correcta', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'staff-1', role: 'STAFF', hashedPassword: passwordHash,
      });

      const response = await login(jsonRequest('/api/account/login', { email: 'staff@test.com', password: PASSWORD }));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Correo o contraseña incorrectos');
      expect(getCookie(response, USER_SESSION_COOKIE)).toBeUndefined();
    });

    test('Debe iniciar sesion a un usuario y entregar la cookie de usuario', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1', role: 'USER', hashedPassword: passwordHash,
      });

      const response = await login(jsonRequest('/api/account/login', { email: ' Ana@Test.com ', password: PASSWORD }));
      const cookie = getCookie(response, USER_SESSION_COOKIE);

      expect(response.status).toBe(200);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'ana@test.com' } })
      );
      expect(cookie).toMatch(/HttpOnly/i);
      expect(cookie).toMatch(/SameSite=lax/i);
      expect(cookie).toMatch(/Path=\//);
      expect(await verifySessionToken(cookieToken(cookie!))).toEqual({ userId: 'user-1', role: 'USER' });
      expect(getCookie(response, SESSION_COOKIE)).toBeUndefined();
    });

    test('Debe retornar 429 despues de 10 intentos desde la misma IP', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const body = { email: 'ana@test.com', password: 'incorrecta' };

      for (let attempt = 0; attempt < 10; attempt++) {
        await login(jsonRequest('/api/account/login', body, '192.168.1.20'));
      }
      const response = await login(jsonRequest('/api/account/login', body, '192.168.1.20'));

      expect(response.status).toBe(429);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(10);
    }, 15000);
  });

  // ==========================================
  // POST /api/account/logout
  // ==========================================
  describe('POST /api/account/logout', () => {
    function logoutRequest(locale?: string) {
      const form = new FormData();
      if (locale) form.set('locale', locale);
      return new Request('http://localhost:3000/api/account/logout', { method: 'POST', body: form });
    }

    test('Debe borrar la cookie de usuario y redirigir al login con 303', async () => {
      const response = await logout(logoutRequest());

      expect(response.status).toBe(303);
      expect(response.headers.get('location')).toBe('http://localhost:3000/es/login');
      expect(getCookie(response, USER_SESSION_COOKIE)).toMatch(/Max-Age=0/);
      expect(getCookie(response, SESSION_COOKIE)).toBeUndefined();
    });

    test('Debe regresar al login en el idioma del formulario', async () => {
      const response = await logout(logoutRequest('en'));

      expect(response.headers.get('location')).toBe('http://localhost:3000/en/login');
    });

    test('Debe ignorar un idioma no soportado', async () => {
      const response = await logout(logoutRequest('fr'));

      expect(response.headers.get('location')).toBe('http://localhost:3000/es/login');
    });
  });
});
