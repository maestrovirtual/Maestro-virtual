import { test, expect, type Page } from '@playwright/test';

// Login de staff → crear → editar → eliminar (cursos y eventos) + error al guardar sin título.
// Correr con: npx playwright test admin-e2e --headed   (o --ui)

// Requiere un usuario STAFF y sus credenciales en el .env (no en el código):
//   E2E_STAFF_EMAIL=...   E2E_STAFF_PASSWORD=...
// Crea y borra datos reales con títulos "E2E <tipo> <fecha>".

// Playwright no lee el .env por su cuenta (Next.js sí).
try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: se usa lo que ya haya en el entorno.
}

const STAFF_EMAIL = process.env.E2E_STAFF_EMAIL ?? '';
const STAFF_PASSWORD = process.env.E2E_STAFF_PASSWORD ?? '';

test.skip(!!process.env.CI, 'Requiere base de datos');
test.skip(!STAFF_EMAIL || !STAFF_PASSWORD, 'Faltan E2E_STAFF_EMAIL y E2E_STAFF_PASSWORD en el .env');

// 500 ms entre acciones para poder verlo; 15 s máximo por acción para fallar rápido
test.use({ launchOptions: { slowMo: 500 }, actionTimeout: 15_000 });

// El «+» del botón es un ícono, por eso no forma parte del nombre accesible.
const ENTIDADES = [
  { nombre: 'curso', ruta: '/es/admin/cursos', botonCrear: /Crear Nuevo Curso/i },
  { nombre: 'evento', ruta: '/es/admin/eventos', botonCrear: /Crear Nuevo Evento/i },
];

async function esperarSplash(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.locator('.app-splash-overlay').waitFor({ state: 'hidden', timeout: 15000 });
}

async function loginStaff(page: Page) {
  await page.goto('/es/staff/login');
  await esperarSplash(page);
  await page.getByLabel('Correo').fill(STAFF_EMAIL);
  await page.getByLabel('Contraseña').fill(STAFF_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/es\/admin/);
}

async function abrirLista(page: Page, ruta: string, botonCrear: RegExp) {
  await page.goto(ruta);
  await esperarSplash(page);
  await expect(page.getByRole('button', { name: botonCrear })).toBeVisible();
}

// Los modales del panel son <div role="dialog">. No usar un selector genérico de «form»:
// el primer form de la página es el de «Cerrar Sesión» del menú lateral.
const modalDe = (page: Page) => page.getByRole('dialog');

// En el formulario las <label> no están enlazadas a su <input>, por lo que getByLabel no funciona.
// El título es el primer campo de texto del modal.
const campoTitulo = (page: Page) =>
  modalDe(page).locator('input[type="text"], input:not([type])').first();

// Fecha futura (AAAA-MM-DD) para el campo obligatorio de los eventos
const fechaFutura = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

async function llenarFormulario(page: Page, titulo: string) {
  const modal = modalDe(page);
  await campoTitulo(page).fill(titulo); // el slug se genera solo a partir del título

  // Descripción corta (placeholder «Breve resumen…») y completa (primer textarea)
  const resumen = modal.getByPlaceholder(/resumen/i).first();
  if (await resumen.count()) await resumen.fill('Resumen creado por la prueba E2E.');
  const detalle = modal.locator('textarea').first();
  if (await detalle.count()) await detalle.fill('Descripción creada por la prueba E2E.');

  // Eventos: la fecha es obligatoria y no trae valor por defecto
  const fecha = modal.locator('input[type="date"]');
  if (await fecha.count()) await fecha.fill(fechaFutura());

  // Guardar como BORRADOR para que no aparezca en el sitio público
  const publicado = modal.getByRole('checkbox', { name: /publicado/i });
  if (await publicado.count()) await publicado.uncheck({ timeout: 3000 }).catch(() => {});
}

async function guardar(page: Page) {
  await page.getByRole('button', { name: /^(guardar|actualizar)/i }).click();
}

// La tarjeta es el ancestro más cercano del título que contiene un botón «Editar».
const tarjetaDe = (page: Page, titulo: string) =>
  page
    .getByText(titulo, { exact: true })
    .first()
    .locator('xpath=ancestor::*[.//button[contains(., "Editar")]][1]');

test.describe('Tarea 25: Pruebas E2E del panel de administración (Staff)', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });

  for (const { nombre, ruta, botonCrear } of ENTIDADES) {
    test(`Debe crear, editar y eliminar un ${nombre}`, async ({ page }) => {
      const titulo = `E2E ${nombre} ${Date.now()}`;
      const tituloEditado = `${titulo} editado`;

      await test.step('Login de staff', async () => {
        await loginStaff(page);
      });

      await test.step(`Crear un ${nombre} y verlo en la lista`, async () => {
        await abrirLista(page, ruta, botonCrear);
        await page.getByRole('button', { name: botonCrear }).click();
        await llenarFormulario(page, titulo);
        await guardar(page);

        await expect(page.getByText(titulo, { exact: true }).first()).toBeVisible({ timeout: 15000 });
      });

      await test.step(`Editar el ${nombre} y ver el cambio`, async () => {
        await tarjetaDe(page, titulo).getByRole('button', { name: 'Editar' }).click();
        await campoTitulo(page).fill(tituloEditado);
        await guardar(page);

        await expect(page.getByText(tituloEditado, { exact: true }).first()).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(titulo, { exact: true })).toHaveCount(0);
      });

      await test.step(`Eliminar el ${nombre} y comprobar que ya no está`, async () => {
        await tarjetaDe(page, tituloEditado).getByRole('button', { name: 'Eliminar' }).click();
        // Confirmar dentro del diálogo. Se exige que el diálogo exista para no pulsar por error
        // el «Eliminar» de otra tarjeta (la base de datos es compartida).
        await expect(modalDe(page)).toBeVisible();
        await modalDe(page).getByRole('button', { name: /eliminar/i }).click();

        await expect(page.getByText(tituloEditado)).toHaveCount(0, { timeout: 15000 });
      });
    });

    test(`Debe mostrar error al guardar un ${nombre} sin título`, async ({ page }) => {
      await loginStaff(page);
      await abrirLista(page, ruta, botonCrear);
      const tarjetasAntes = await page.getByRole('button', { name: 'Editar' }).count();

      await page.getByRole('button', { name: botonCrear }).click();
      await guardar(page); // sin llenar nada

      // El modal sigue abierto y no se creó nada
      await expect(modalDe(page)).toBeVisible();
      // Aviso: el navegador marca el título como faltante o la app muestra un mensaje «obligatorio»
      const tituloFaltante = await campoTitulo(page).evaluate(
        (el) => (el as HTMLInputElement).validity.valueMissing
      );
      const avisoVisible = await page.getByText(/obligatori/i).first().isVisible();
      expect(tituloFaltante || avisoVisible).toBe(true);
      await expect(page.getByRole('button', { name: 'Editar' })).toHaveCount(tarjetasAntes);
    });
  }

  test('Debe mandar al login a quien entra al panel sin sesión', async ({ page }) => {
    await page.goto('/es/admin/cursos');
    await esperarSplash(page);

    await expect(page).toHaveURL(/\/es\/staff\/login$/);
    await expect(page.getByRole('heading', { name: 'Acceso para staff' })).toBeVisible();
  });
});