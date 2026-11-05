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

  it('muestra el botón "Explorar evento" y si tiene imagen la despliega sin recortar con object-contain', () => {
    const eventWithImage: EventItem = {
      id: 'evt-img-1',
      title: 'Taller con Afiche Digital',
      category: 'canva',
      profile: 'Estudiantes y profesores',
      objective: 'Aprender diseño y tecnología',
      duration: '4 horas',
      participants: '25 personas',
      date: '2026-11-20',
      time: '14:00 - 18:00 hrs',
      modality: 'presencial',
      location: 'Auditorio Central',
      requirements: 'Llevar laptop con cargador',
      image: 'https://fqwgfgppvlqgddxvzixu.supabase.co/storage/v1/object/public/events/poster.jpeg',
    };

    render(<EventCard event={eventWithImage} />);

    // Verifica que el botón "Explorar evento" existe
    const exploreBtn = screen.getByRole('button', { name: /explorar evento/i });
    expect(exploreBtn).toBeInTheDocument();

    // Verifica que la imagen existe y tiene clase object-contain (sin recortar)
    const imgEl = screen.getByAltText('Taller con Afiche Digital');
    expect(imgEl).toBeInTheDocument();
    expect(imgEl.className).toContain('object-contain');
  });

  it('abre el modal de detalles con información completa y afiche al hacer clic en "Explorar evento"', async () => {
    const { fireEvent, within } = await import('@testing-library/react');

    const eventDetails: EventItem = {
      id: 'evt-modal-1',
      title: 'Hackathon Ambiental 2026',
      category: 'emprendimiento',
      profile: 'Desarrolladores y emprendedores ecológicos',
      objective: 'Crear soluciones sostenibles de alto impacto',
      duration: '24 horas continuas',
      participants: '100 participantes',
      date: '2026-11-30',
      time: '09:00 hrs',
      modality: 'presencial',
      location: 'Tec de Monterrey',
      address: 'Centro de Biotecnología',
      requirements: 'Conocimientos de programación y ganas de colaborar',
      image: 'https://fqwgfgppvlqgddxvzixu.supabase.co/storage/v1/object/public/events/hackathon.png',
    };

    render(<EventCard event={eventDetails} />);

    // El modal no debe estar visible inicialmente
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Hacemos clic en "Explorar evento"
    const exploreBtn = screen.getByRole('button', { name: /explorar evento/i });
    fireEvent.click(exploreBtn);

    // Ahora el modal dialog está visible
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Contiene la información detallada (perfil, requisitos, afiche completo) dentro del modal
    expect(within(dialog).getByText(/Desarrolladores y emprendedores ecológicos/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Conocimientos de programación y ganas de colaborar/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/24 horas continuas/i)).toBeInTheDocument();

    // Cierra el modal con el botón "Cerrar" dentro del modal
    const closeBtn = within(dialog).getByRole('button', { name: /cerrar$/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza la sección dedicada de Descripción con whitespace-pre-wrap y clases de alto contraste', async () => {
    const { fireEvent, within } = await import('@testing-library/react');

    const multilineDescription = 'Esta es una descripción detallada:\n• Punto clave 1\n• Punto clave 2\n\n¡Los esperamos!';

    const eventWithDesc: EventItem = {
      id: 'evt-desc-1',
      title: 'Taller de Inteligencia Artificial',
      category: 'canva',
      profile: 'Profesores universitarios',
      objective: 'Aprender IA básica',
      description: multilineDescription,
      duration: '3 sesiones de 2 horas',
      participants: '30 cupos',
      date: '2026-11-25',
      time: '16:00 - 18:00 hrs',
      modality: 'online',
      platform: 'Zoom',
    };

    render(<EventCard event={eventWithDesc} />);

    // Abrir modal
    const exploreBtn = screen.getByRole('button', { name: /explorar evento/i });
    fireEvent.click(exploreBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Sección "Descripción" debe existir
    expect(within(dialog).getByText('Descripción')).toBeInTheDocument();

    // El contenido de la descripción debe estar presente
    const descContent = within(dialog).getByText(/Esta es una descripción detallada/i);
    expect(descContent).toBeInTheDocument();
    expect(descContent.className).toContain('whitespace-pre-wrap');

    // Comprobar clases de contraste de texto
    const titleEl = within(dialog).getByText('Taller de Inteligencia Artificial');
    expect(titleEl.className).toContain('text-gray-900');
    expect(titleEl.className).toContain('dark:text-gray-100');

    // Horario / duración y fecha deben tener clases con contraste explícito
    const timeValue = within(dialog).getByText(/16:00 - 18:00 hrs/i);
    expect(timeValue.className).toContain('text-gray-900');
    expect(timeValue.className).toContain('dark:text-gray-100');
  });
});
