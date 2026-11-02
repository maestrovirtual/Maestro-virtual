import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventCard from '@/features/events/EventCard';
import type { EventItem } from '@/types/event';

describe('Public EventCard', () => {
  it('renderiza correctamente un evento con categoría conocida', () => {
    const event: EventItem = {
      id: 'evt-1',
      title: 'Taller de Excel Avanzado',
      category: 'excel',
      profile: 'Docentes',
      objective: 'Aprender fórmulas y tablas dinámicas',
      duration: '2 horas',
      participants: '20 personas',
      date: '2026-10-25',
      time: '10:00 - 12:00 hrs',
      modality: 'presencial',
      location: 'Campus Monterrey',
      address: 'Sala B',
    };

    render(<EventCard event={event} />);

    expect(screen.getByText('Taller de Excel Avanzado')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('Presencial')).toBeInTheDocument();
    expect(screen.getByText(/Campus Monterrey — Sala B/i)).toBeInTheDocument();
  });

  it('no se rompe al recibir una categoría no registrada o "general" (fallback seguro a defaultCategoryStyle)', () => {
    const eventWithUnknownCategory = {
      id: 'evt-2',
      title: 'Evento General de Tecnología',
      category: 'general' as unknown as EventItem['category'],
      profile: 'General',
      objective: 'Presentación general de proyectos',
      duration: '1 hora',
      participants: '50 personas',
      date: '2026-11-15T18:00:00.000Z',
      time: '18:00 hrs',
      modality: 'online' as const,
      platform: 'Google Meet',
    };

    expect(() => {
      render(<EventCard event={eventWithUnknownCategory} />);
    }).not.toThrow();

    expect(screen.getByText('Evento General de Tecnología')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('En línea')).toBeInTheDocument();
    expect(screen.getByText(/Vía Google Meet/i)).toBeInTheDocument();
  });

  it('soporta fecha en formato ISO y modalidad en mayúsculas sin arrojar errores', () => {
    const eventFromPrisma = {
      id: 'evt-3',
      title: 'Seminario Web de Innovación',
      category: 'arbitraria' as unknown as EventItem['category'],
      profile: 'Docentes',
      objective: 'Innovar en el aula',
      duration: '3 horas',
      participants: '30 personas',
      date: '2026-12-01T00:00:00.000Z',
      time: '11:00 hrs',
      modality: 'ONLINE' as unknown as EventItem['modality'],
    };

    expect(() => {
      render(<EventCard event={eventFromPrisma} />);
    }).not.toThrow();

    expect(screen.getByText('Seminario Web de Innovación')).toBeInTheDocument();
    expect(screen.getByText('Arbitraria')).toBeInTheDocument();
    expect(screen.getByText('En línea')).toBeInTheDocument();
  });
});
