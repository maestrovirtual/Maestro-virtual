import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Button from '../src/components/ui/Button';

describe('Componente UI: Button', () => {
  it('debe renderizar el texto (children) correctamente', () => {
    render(<Button>Guardar Cambios</Button>);

    const buttonElement = screen.getByRole('button', { name: /guardar cambios/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('debe aplicar las props por defecto (type="button", variant="primary", size="md")', () => {
    render(<Button>Aceptar</Button>);

    const buttonElement = screen.getByRole('button', { name: /aceptar/i });

    // Verifica atributos por defecto
    expect(buttonElement).toHaveAttribute('type', 'button');
    expect(buttonElement).not.toBeDisabled();

    // Verifica clases de variant="primary" y size="md"
    expect(buttonElement).toHaveClass('bg-primary');
    expect(buttonElement).toHaveClass('px-4 py-2.5');
  });

  it('debe ejecutar la función onClick cuando el usuario hace clic', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Enviar Formulario</Button>);

    const buttonElement = screen.getByRole('button', { name: /enviar formulario/i });
    fireEvent.click(buttonElement);

    // Verifica que el handler se ejecutó exactamente 1 vez
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe estar deshabilitado y no disparar el evento onClick cuando disabled es true', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Procesando...
      </Button>
    );

    const buttonElement = screen.getByRole('button', { name: /procesando.../i });

    // Verifica el atributo disabled y las clases asociadas de Tailwind
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('disabled:cursor-not-allowed');

    // Intentar hacer clic no debe llamar a handleClick
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('debe aplicar correctamente la variante "danger"', () => {
    render(<Button variant="danger">Eliminar Cuenta</Button>);

    const buttonElement = screen.getByRole('button', { name: /eliminar cuenta/i });
    expect(buttonElement).toHaveClass('bg-brand-red');
  });

  it('debe aplicar correctamente la variante "outline" y tamaño "sm"', () => {
    render(
      <Button variant="outline" size="sm">
        Cancelar
      </Button>
    );

    const buttonElement = screen.getByRole('button', { name: /cancelar/i });
    expect(buttonElement).toHaveClass('bg-transparent');
    expect(buttonElement).toHaveClass('px-3 py-2');
  });

  it('debe combinar clases personalizadas recibidas por className', () => {
    render(<Button className="mt-4 shadow-lg">Mi Botón Custom</Button>);

    const buttonElement = screen.getByRole('button', { name: /mi botón custom/i });
    expect(buttonElement).toHaveClass('mt-4', 'shadow-lg');
  });
});