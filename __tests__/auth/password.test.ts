/**
 * @jest-environment node
 */

import { hashPassword, verifyPassword } from '../../src/lib/auth/password';

describe('lib/auth/password', () => {
  test('Debe verificar la contraseña correcta contra su hash', async () => {
    const hash = await hashPassword('contraseña-segura-123');

    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('contraseña-segura-123', hash)).toBe(true);
  });

  test('Debe rechazar una contraseña incorrecta', async () => {
    const hash = await hashPassword('contraseña-segura-123');

    expect(await verifyPassword('otra-contraseña', hash)).toBe(false);
  });

  test('Debe generar hashes distintos para la misma contraseña (salt aleatorio)', async () => {
    const [a, b] = await Promise.all([
      hashPassword('misma-contraseña'),
      hashPassword('misma-contraseña'),
    ]);

    expect(a).not.toBe(b);
  });

  test('Debe rechazar hashes con formato invalido sin lanzar error', async () => {
    expect(await verifyPassword('x', '')).toBe(false);
    expect(await verifyPassword('x', 'texto-plano')).toBe(false);
    expect(await verifyPassword('x', '$2b$10$hashDeBcrypt')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$abc$8$1$c2FsdA==$aGFzaA==')).toBe(false);
  });
});
