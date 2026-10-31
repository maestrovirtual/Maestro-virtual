import { test, expect, type Page } from '@playwright/test';

// MV-41: flujo E2E de inscripción. Se ve en el navegador a velocidad lenta.
// Correr con: npx playwright test enrollment-flow --headed   (o --ui)
//
// Usa UNA cuenta fija: intenta registrarla y, si ya existe (409), solo inicia sesión.
// Antes de correr borra las inscripciones de esa cuenta para poder inscribirse de nuevo.
// El correo de confirmación (MV-38) no se prueba aquí.

const COURSE_PATH = '/es/courses/aprendiendo-tecnologias';
const EVENTS_PATH = '/es/events'; // AJUSTAR si la ruta de eventos es otra

// delivered@resend.dev es una dirección de prueba de Resend: simula una entrega exitosa
// y no llega a ninguna persona real (la inscripción envía un correo de confirmación).
const USER = { name: 'E2E Fijo', email: 'delivered@resend.dev', password: 'Test1234!' };

const ENROLL_BTN = /inscrib|inscríb/i; // cubre Inscribirme / Inscribirse / Inscríbete
const CONFIRM_BTN = 'Confirmar Inscripción';
const ENROLLED_TEXT = /Ya estás inscrito/i;
const SUCCESS_MSG = /Te has inscrito al curso con éxito/i;
const GREETING = /Hola, E2E/;

// 700 ms entre acciones para poder verlo; 15 s máximo por acción para fallar rápido si un selector no existe
test.use({ launchOptions: { slowMo: 700 }, actionTimeout: 15_000 });

// Necesita la BD (cuenta real), así que no corre en CI.
test.skip(!!process.env.CI, 'Requiere base de datos');

async function esperarSplash(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.locator('.app-splash-overlay').waitFor({ state: 'hidden', timeout: 15000 });
}

type ClientePrisma = {
  enrollment: { deleteMany: (args: object) => Promise<unknown> };
  $disconnect: () => Promise<void>;
};

function esClientePrisma(valor: unknown): valor is ClientePrisma {
  return typeof valor === 'object' && valor !== null && 'enrollment' in valor;
}

async function limpiarInscripciones() {
  // Playwright no lee el .env por su cuenta (Next.js sí): se carga aquí para Prisma.
  try {
    process.loadEnvFile('.env');
  } catch {
    // Sin .env o Node antiguo: se usa lo que ya haya en el entorno.
  }
  try {
    // Playwright compila a CommonJS: según el interop, el cliente puede venir en
    // modulo.default, modulo.default.default o modulo.prisma.
    const modulo = (await import('../src/lib/prisma/client')) as unknown as {
      default?: unknown;
      prisma?: unknown;
    };
    const candidatos = [modulo.default, (modulo.default as { default?: unknown })?.default, modulo.prisma];
    const prisma = candidatos.find(esClientePrisma);
    if (!prisma) {
      throw new Error('No se encontró el cliente de Prisma (con .enrollment) en src/lib/prisma/client.');
    }
    await prisma.enrollment.deleteMany({ where: { user: { email: USER.email } } });
    await prisma.$disconnect();
  } catch (error) {
    console.warn('No se pudo limpiar las inscripciones previas; el test se adapta.', error);
  }
}

async function iniciarSesion(page: Page) {
  await page.getByLabel('Correo').fill(USER.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(USER.password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
}

// Devuelve true si realmente se inscribió; false si ya estaba inscrito.
async function inscribirse(page: Page): Promise<boolean> {
  const inscrito = page.getByText(ENROLLED_TEXT).first();
  const botonInscribirse = page.getByRole('button', { name: ENROLL_BTN }).first();
  // La página puede seguir en carga: esperar a que aparezca uno de los dos estados.
  await expect(botonInscribirse.or(inscrito)).toBeVisible({ timeout: 30000 });
  if (await inscrito.isVisible()) {
    test.info().annotations.push({ type: 'aviso', description: 'Ya estaba inscrito antes de empezar.' });
    return false;
  }
  await botonInscribirse.click();
  await page.getByRole('button', { name: CONFIRM_BTN }).click(); // modal de confirmación
  await expect(inscrito).toBeVisible();
  return true;
}

test.describe('MV-41: Flujo de inscripción', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 }); // misma cuenta; margen por slowMo y BD remota
  test.beforeAll(limpiarInscripciones);

  test('Debe completar el flujo de un curso: registro o login, inscripcion, logout y login', async ({ page }) => {
    await test.step('Error comun: inscribirse sin estar logueado manda al login', async () => {
      await page.goto(COURSE_PATH);
      await esperarSplash(page);
      await page.getByRole('button', { name: ENROLL_BTN }).first().click();

      await expect(page).toHaveURL(/\/es\/login\?next=/);
    });

    await test.step('Registrar la cuenta; si ya existe (409), iniciar sesion', async () => {
      await page.goto('/es/register?next=' + encodeURIComponent(COURSE_PATH));
      await esperarSplash(page);
      await page.getByLabel('Nombre').fill(USER.name);
      await page.getByLabel('Correo').fill(USER.email);
      await page.getByLabel('Contraseña', { exact: true }).fill(USER.password);
      await page.getByLabel('Confirma tu contraseña').fill(USER.password);

      const [respuesta] = await Promise.all([
        page.waitForResponse(
          (r) => r.url().includes('/api/account/register') && r.request().method() === 'POST'
        ),
        page.getByRole('button', { name: /crear cuenta|registrar/i }).click(),
      ]);
      expect([201, 409]).toContain(respuesta.status());

      if (respuesta.status() === 409) {
        // La cuenta ya existía: solo iniciar sesión
        await page.goto('/es/login?next=' + encodeURIComponent(COURSE_PATH));
        await esperarSplash(page);
        await iniciarSesion(page);
      }

      await expect(page).toHaveURL(new RegExp(COURSE_PATH + '$'));
      await expect(page.getByText(GREETING)).toBeVisible();
    });

    await test.step('Inscripcion al curso: abrir modal, confirmar y quedar inscrito', async () => {
      await esperarSplash(page);
      const seInscribio = await inscribirse(page);
      if (seInscribio) {
        await expect(page.getByText(SUCCESS_MSG)).toBeVisible();
        await expect(page.getByRole('button', { name: ENROLL_BTN })).toHaveCount(0);
      }
    });

    await test.step('Cerrar sesion', async () => {
      await page.getByText(GREETING).click();
      // Opción del menú del usuario (no es un botón): se busca por texto, solo la visible
    await page.getByText(/cerrar sesión/i).locator('visible=true').first().click();
      await expect(page).toHaveURL(/\/es\/login/);
    });

    await test.step('Volver a iniciar sesion y ver que sigue inscrito', async () => {
      await esperarSplash(page);
      await iniciarSesion(page);
      await expect(page.getByText(GREETING)).toBeVisible();

      await page.goto(COURSE_PATH);
      await esperarSplash(page);
      await expect(page.getByText(ENROLLED_TEXT).first()).toBeVisible();
    });

    await page.waitForTimeout(2000); // pausa final para ver el resultado
  });

  test('Debe inscribir a la cuenta en un evento', async ({ page }) => {
    // Si no hay eventos publicados no hay nada que probar: se salta con aviso.
    await page.goto(EVENTS_PATH);
    await esperarSplash(page);
    const botonInscribirse = page.getByRole('button', { name: ENROLL_BTN }).first();
    const sinEventos = page.getByText(/Aún no hay eventos programados/i);
    await expect(botonInscribirse.or(sinEventos)).toBeVisible();
    test.skip(await sinEventos.isVisible(), 'No hay eventos publicados: crea uno desde el panel de staff.');

    await test.step('Error comun: inscribirse a un evento sin sesion manda al login', async () => {
      await botonInscribirse.click();

      await expect(page).toHaveURL(/\/es\/login\?next=/);
    });

    await test.step('Iniciar sesion con la cuenta fija', async () => {
      await page.goto('/es/login?next=' + encodeURIComponent(EVENTS_PATH));
      await esperarSplash(page);
      await iniciarSesion(page);

      await expect(page).toHaveURL(new RegExp(EVENTS_PATH + '$'));
      await expect(page.getByText(GREETING)).toBeVisible();
    });

    await test.step('Inscripcion al evento: confirmar y quedar inscrito', async () => {
      await esperarSplash(page);
      await inscribirse(page);

      await page.reload();
      await esperarSplash(page);
      await expect(page.getByText(ENROLLED_TEXT).first()).toBeVisible();
    });

    await page.waitForTimeout(2000);
  });
});