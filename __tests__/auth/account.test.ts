import {
  isValidEmail,
  normalizeEmail,
  passwordError,
  safeNextPath,
} from '../../src/lib/auth/account';
import { createRateLimiter } from '../../src/lib/auth/rate-limit';

describe('lib/auth/account', () => {
  test('normalizeEmail quita espacios y mayusculas', () => {
    expect(normalizeEmail('  Ana@Test.COM ')).toBe('ana@test.com');
    expect(normalizeEmail(42)).toBe('');
  });

  test('isValidEmail rechaza correos mal formados o demasiado largos', () => {
    expect(isValidEmail('ana@test.com')).toBe(true);
    expect(isValidEmail('ana@test')).toBe(false);
    expect(isValidEmail(`${'a'.repeat(250)}@test.com`)).toBe(false);
  });

  test('passwordError exige entre 8 y 128 caracteres', () => {
    expect(passwordError('1234567')).toMatch(/al menos 8/);
    expect(passwordError('12345678')).toBeNull();
    expect(passwordError('a'.repeat(129))).toMatch(/más de 128/);
  });

  describe('safeNextPath', () => {
    test.each([
      '/es/courses/excel',
      '/en/events?tipo=taller',
    ])('Debe aceptar la ruta interna %s', (path) => {
      expect(safeNextPath(path, '/es')).toBe(path);
    });

    test.each([
      ['protocolo relativo', '//otro.sitio/robar'],
      ['diagonal invertida', '/\\otro.sitio'],
      ['tabulador antes de //', '/\t/otro.sitio'],
      ['URL absoluta', 'https://otro.sitio'],
      ['javascript:', 'javascript:alert(1)'],
      ['ruta relativa', 'es/courses'],
    ])('Debe usar el valor por defecto con %s', (_case, path) => {
      expect(safeNextPath(path, '/es')).toBe('/es');
    });

    test('Debe usar el valor por defecto si no es texto', () => {
      expect(safeNextPath(undefined, '/es')).toBe('/es');
      expect(safeNextPath(['/es/a', '/es/b'], '/es')).toBe('/es');
    });
  });
});

describe('lib/auth/rate-limit', () => {
  test('Debe bloquear al pasar el maximo y liberar al terminar la ventana', () => {
    jest.useFakeTimers();
    const isRateLimited = createRateLimiter({ windowMs: 1000, max: 2 });

    expect(isRateLimited('ip-1')).toBe(false);
    expect(isRateLimited('ip-1')).toBe(false);
    expect(isRateLimited('ip-1')).toBe(true);
    expect(isRateLimited('ip-2')).toBe(false);

    jest.advanceTimersByTime(1001);
    expect(isRateLimited('ip-1')).toBe(false);
    jest.useRealTimers();
  });
});
