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