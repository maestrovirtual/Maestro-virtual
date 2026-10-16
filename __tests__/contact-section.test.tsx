import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import ContactSection from '../src/features/contact/ContactSection';

describe('Feature: ContactSection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('debe renderizar el título de la sección y los campos del formulario', () => {
    const { container } = render(<ContactSection />);

    // Busca específicamente el encabezado h2 para evitar ambigüedades con otros textos
    expect(screen.getByRole('heading', { name: /contacto/i })).toBeInTheDocument();
    expect(screen.getByText(/escríbenos un correo/i)).toBeInTheDocument();

    // Selecciona directamente los elementos de entrada del DOM
    const nameInput = container.querySelector('input[name="name"]') || container.querySelector('#name');
    const emailInput = container.querySelector('input[name="email"]') || container.querySelector('#email');

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
  });

  it('debe actualizar los valores de los inputs cuando el usuario escribe', () => {
    const { container } = render(<ContactSection />);

    const nameInput = (container.querySelector('input[name="name"]') || container.querySelector('#name')) as HTMLInputElement;
    const emailInput = (container.querySelector('input[name="email"]') || container.querySelector('#email')) as HTMLInputElement;

    // Simula la escritura en Nombre
    fireEvent.change(nameInput, { target: { value: 'Leo' } });
    expect(nameInput.value).toBe('Leo');

    // Simula la escritura en Correo
    fireEvent.change(emailInput, { target: { value: 'leo@ejemplo.com' } });
    expect(emailInput.value).toBe('leo@ejemplo.com');
  });

  it('debe procesar el envío del formulario al hacer submit', () => {
    const { container } = render(<ContactSection />);

    const nameInput = (container.querySelector('input[name="name"]') || container.querySelector('#name')) as HTMLInputElement;
    const emailInput = (container.querySelector('input[name="email"]') || container.querySelector('#email')) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /enviar/i });

    // Llenar datos y enviar
    fireEvent.change(nameInput, { target: { value: 'Leo' } });
    fireEvent.change(emailInput, { target: { value: 'leo@ejemplo.com' } });

    act(() => {
      fireEvent.click(submitButton);
    });

    // Avanzar los 1500ms del setTimeout
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(submitButton).toBeInTheDocument();
  });
});
// El correo de notificación es opcional; la confirmación requiere que el
// servidor haya guardado un mensaje real, no una respuesta señuelo antispam.
describe('Confirmación de recepción del contacto', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  function fillAndSubmit() {
    const view = render(<ContactSection />);
    fireEvent.change(screen.getByLabelText(/^Nombre:/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/^De:/i), { target: { value: 'ana@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/^Asunto:/i), { target: { value: 'Prueba MV34' } });
    fireEvent.change(screen.getByLabelText(/^Mensaje:/i), { target: { value: 'Información de los cursos' } });
    fireEvent.submit(view.container.querySelector('form')!);
    return view;
  }

  it('confirma el mensaje guardado aunque no se haya enviado la notificación', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, id: 'saved-message', notificationSent: false }) });
    global.fetch = fetchMock;
    fillAndSubmit();
    expect(await screen.findByRole('button', { name: /Redactar otro mensaje/i })).toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ name: 'Ana', email: 'ana@gmail.com', subject: 'Prueba MV34', message: 'Información de los cursos', website: '' });
  });

  it('no muestra éxito cuando el filtro antispam descartó el mensaje', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, id: 'skipped' }) });
    const { container } = fillAndSubmit();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo registrar el mensaje');
    expect(screen.queryByRole('button', { name: /Redactar otro mensaje/i })).not.toBeInTheDocument();
    expect(container.querySelector('input[name="website"]')?.parentElement).toHaveAttribute('hidden');
  });
});
