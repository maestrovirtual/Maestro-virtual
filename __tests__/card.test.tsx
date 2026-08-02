import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Card from '../src/components/ui/Card';

describe('Componente UI: Card', () => {
  it('debe renderizar el contenido (children) correctamente', () => {
    render(<Card>Contenido del curso</Card>);

    const cardContent = screen.getByText('Contenido del curso');
    expect(cardContent).toBeInTheDocument();
  });

  it('debe aplicar la variante por defecto ("default")', () => {
    render(<Card data-testid="card-element">Tarjeta Base</Card>);

    const cardElement = screen.getByTestId('card-element');

    // Verifica las clases base y las de la variante 'default'
    expect(cardElement).toHaveClass('rounded-xl', 'p-6');
    expect(cardElement).toHaveClass('bg-surface', 'border-border');
    expect(cardElement).toHaveClass('hover:border-primary/30');
  });

  it('debe aplicar las clases de la variante "elevated"', () => {
    render(
      <Card variant="elevated" data-testid="card-element">
        Tarjeta Elevada
      </Card>
    );

    const cardElement = screen.getByTestId('card-element');
    expect(cardElement).toHaveClass('shadow-sm', 'hover:shadow-md');
  });

  it('debe aplicar las clases de la variante "outlined"', () => {
    render(
      <Card variant="outlined" data-testid="card-element">
        Tarjeta Outlined
      </Card>
    );

    const cardElement = screen.getByTestId('card-element');
    expect(cardElement).toHaveClass('bg-transparent', 'border-border');
  });

  it('debe combinar clases extras pasadas mediante className', () => {
    render(
      <Card className="mt-6 max-w-md" data-testid="card-element">
        Tarjeta con margen
      </Card>
    );

    const cardElement = screen.getByTestId('card-element');
    expect(cardElement).toHaveClass('mt-6', 'max-w-md');
  });

  it('debe propagar atributos HTML adicionales a través de ...props', () => {
    render(
      <Card id="card-principal" aria-label="Tarjeta Informativa" data-testid="card-element">
        Tarjeta con Props
      </Card>
    );

    const cardElement = screen.getByTestId('card-element');
    expect(cardElement).toHaveAttribute('id', 'card-principal');
    expect(cardElement).toHaveAttribute('aria-label', 'Tarjeta Informativa');
  });
});