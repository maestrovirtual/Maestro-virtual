/**
 * @jest-environment node
 */

import { SignJWT } from 'jose';
import {
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
  SESSION_DURATION_SECONDS,
} from '../../src/lib/auth/session';

const TEST_SECRET = 'secreto-de-prueba-con-mas-de-32-caracteres';
const originalSecret = process.env.AUTH_SECRET;

describe('lib/auth/session', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    process.env.AUTH_SECRET = originalSecret;
  });

  test('Debe crear un token y recuperar su contenido al verificarlo', async () => {
    const token = await createSessionToken({ userId: 'user-1', role: 'STAFF' });

    expect(await verifySessionToken(token)).toEqual({ userId: 'user-1', role: 'STAFF' });
  });

  test('Debe rechazar un token alterado', async () => {
    const token = await createSessionToken({ userId: 'user-1', role: 'USER' });
    const [header, , signature] = token.split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({ sub: 'user-1', role: 'STAFF' })
    ).toString('base64url');

    expect(await verifySessionToken(`${header}.${forgedPayload}.${signature}`)).toBeNull();
  });

  test('Debe rechazar un token firmado con otro secreto', async () => {
    const token = await createSessionToken({ userId: 'user-1', role: 'STAFF' });
    process.env.AUTH_SECRET = 'otro-secreto-distinto-con-mas-de-32-caracteres';

    expect(await verifySessionToken(token)).toBeNull();
  });

  test('Debe rechazar un token expirado', async () => {
    const key = new TextEncoder().encode(TEST_SECRET);
    const expired = await new SignJWT({ role: 'STAFF' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-1')
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(key);

    expect(await verifySessionToken(expired)).toBeNull();
  });

  test('Debe rechazar un token sin rol valido', async () => {
    const key = new TextEncoder().encode(TEST_SECRET);
    const token = await new SignJWT({ role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-1')
      .setExpirationTime('1h')
      .sign(key);

    expect(await verifySessionToken(token)).toBeNull();
  });

  test('Debe devolver null si no hay token', async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken('')).toBeNull();
  });

  test('Debe fallar cerrado si AUTH_SECRET falta o es demasiado corto', async () => {
    const token = await createSessionToken({ userId: 'user-1', role: 'STAFF' });

    delete process.env.AUTH_SECRET;
    expect(await verifySessionToken(token)).toBeNull();
    await expect(createSessionToken({ userId: 'user-1', role: 'STAFF' })).rejects.toThrow();

    process.env.AUTH_SECRET = 'corto';
    expect(await verifySessionToken(token)).toBeNull();
    await expect(createSessionToken({ userId: 'user-1', role: 'STAFF' })).rejects.toThrow();
  });

  test('Debe configurar la cookie como httpOnly, sameSite lax y con la duracion de la sesion', () => {
    expect(sessionCookieOptions()).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    });
    expect(sessionCookieOptions(0).maxAge).toBe(0);
  });
});
