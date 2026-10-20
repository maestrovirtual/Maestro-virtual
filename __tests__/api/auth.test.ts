/**
 * @jest-environment node
 */

import { POST as login } from '../../src/app/api/auth/login/route';
import { POST as logout } from '../../src/app/api/auth/logout/route';
import prisma from '../../src/lib/prisma/client';
import { hashPassword } from '../../src/lib/auth/password';
import { verifySessionToken, SESSION_COOKIE } from '../../src/lib/auth/session';

jest.mock('../../src/lib/prisma/client', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const originalSecret = process.env.AUTH_SECRET;
const PASSWORD = 'contraseña-del-staff-123';
let passwordHash: string;

function loginRequest(body: unknown) {
  return new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function getSessionCookie(response: Response) {
  return response.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`));
}

describe('API /api/auth', () => {
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
  // POST /api/auth/login
  // ==========================================
  describe('POST /api/auth/login', () => {
    test('Debe retornar 400 si falta el correo o la contraseña', async () => {
      const response = await login(loginRequest({ email: 'staff@test.com' }));

      expect(response.status).toBe(400);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('Debe retornar 400 si el cuerpo no es JSON valido', async () => {
      const response = await login(loginRequest('no-es-json'));

      expect(response.status).toBe(400);
    });

    test('Debe retornar 401 si el correo no existe', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await login(loginRequest({ email: 'nadie@test.com', password: PASSWORD }));

      expect(response.status).toBe(401);
      expect(getSessionCookie(response)).toBeUndefined();
    });

    test('Debe retornar 401 si la contraseña es incorrecta', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'staff-1', role: 'STAFF', hashedPassword: passwordHash,
      });

      const response = await login(loginRequest({ email: 'staff@test.com', password: 'incorrecta' }));

      expect(response.status).toBe(401);
      expect(getSessionCookie(response)).toBeUndefined();
    });

    test('Debe retornar 401 a un usuario sin rol staff aunque su contraseña sea correcta', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1', role: 'USER', hashedPassword: passwordHash,
      });

      const response = await login(loginRequest({ email: 'usuario@test.com', password: PASSWORD }));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Correo o contraseña incorrectos');
      expect(getSessionCookie(response)).toBeUndefined();
    });

    test('Debe iniciar sesion a un staff y entregar la cookie de sesion', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'staff-1', role: 'STAFF', hashedPassword: passwordHash,
      });

      const response = await login(loginRequest({ email: ' Staff@Test.com ', password: PASSWORD }));
      const cookie = getSessionCookie(response);

      expect(response.status).toBe(200);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'staff@test.com' } })
      );
      expect(cookie).toMatch(/HttpOnly/i);
      expect(cookie).toMatch(/SameSite=lax/i);
      expect(cookie).toMatch(/Path=\//);

      const token = cookie!.split(';')[0].split('=')[1];
      expect(await verifySessionToken(token)).toEqual({ userId: 'staff-1', role: 'STAFF' });
    });

    test('Debe retornar 500 sin entregar cookie si AUTH_SECRET no esta configurado', async () => {
      delete process.env.AUTH_SECRET;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'staff-1', role: 'STAFF', hashedPassword: passwordHash,
      });

      const response = await login(loginRequest({ email: 'staff@test.com', password: PASSWORD }));

      expect(response.status).toBe(500);
      expect(getSessionCookie(response)).toBeUndefined();
    });
  });

  // ==========================================
  // POST /api/auth/logout
  // ==========================================
  describe('POST /api/auth/logout', () => {
    test('Debe borrar la cookie y redirigir al login con 303', async () => {
      const response = await logout(
        new Request('http://localhost:3000/api/auth/logout', { method: 'POST' })
      );

      expect(response.status).toBe(303);
      expect(response.headers.get('location')).toBe('http://localhost:3000/es/staff/login');
      expect(getSessionCookie(response)).toMatch(/Max-Age=0/);
      expect(getSessionCookie(response)).toMatch(/Path=\//);
    });

    test('Debe redirigir al login en el idioma de la pagina de origen', async () => {
      const response = await logout(
        new Request('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: { referer: 'http://localhost:3000/en/admin/cursos' },
        })
      );

      expect(response.headers.get('location')).toBe('http://localhost:3000/en/staff/login');
    });
  });
});
