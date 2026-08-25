import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Container from '../src/components/ui/Container';

describe('Componente UI: Container', () => {
  it('debe renderizar el contenido (children) correctamente', () => {
    render(<Container>Contenido dentro del contenedor</Container>);

    const containerContent = screen.getByText('Contenido dentro del contenedor');
    expect(containerContent).toBeInTheDocument();
  });

  it('debe aplicar las clases base y el tamaño por defecto ("xl")', () => {
    render(<Container>Contenido Base</Container>);

    const containerElement = screen.getByText('Contenido Base');

    // Verifica clases base de layout y padding responsive
    expect(containerElement).toHaveClass('mx-auto', 'w-full', 'px-4', 'sm:px-6', 'lg:px-8');

    // Tamaño por defecto xl (max-w-7xl)
    expect(containerElement).toHaveClass('max-w-7xl');
  });

  it('debe aplicar correctamente la clase de tamaño "sm"', () => {
    render(<Container size="sm">Contenido Pequeño</Container>);

    const containerElement = screen.getByText('Contenido Pequeño');
    expect(containerElement).toHaveClass('max-w-3xl');
  });

  it('debe aplicar correctamente las clases para los demás tamaños ("md", "lg", "full")', () => {
    const { rerender } = render(<Container size="md">Texto Mediano</Container>);

    let containerElement = screen.getByText('Texto Mediano');
    expect(containerElement).toHaveClass('max-w-5xl');

    rerender(<Container size="lg">Texto Grande</Container>);
    containerElement = screen.getByText('Texto Grande');
    expect(containerElement).toHaveClass('max-w-6xl');

    rerender(<Container size="full">Texto Completo</Container>);
    containerElement = screen.getByText('Texto Completo');
    expect(containerElement).toHaveClass('max-w-full');
  });

  it('debe combinar clases extras pasadas mediante className', () => {
    render(<Container className="py-12 bg-background">Contenido Custom</Container>);

    const containerElement = screen.getByText('Contenido Custom');
    expect(containerElement).toHaveClass('py-12', 'bg-background');
  });
});