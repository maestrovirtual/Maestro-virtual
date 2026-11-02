import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminEventCard from '@/features/admin/components/AdminEventCard';
import DeleteConfirmModal from '@/features/admin/components/DeleteConfirmModal';
import EventModal from '@/features/admin/components/EventModal';
import { createEventAction, updateEventAction } from '@/features/admin/actions/event.actions';
import type { AdminEvent } from '@/features/admin/types/event.types';

// Mock server actions
jest.mock('@/features/admin/actions/event.actions', () => ({
  createEventAction: jest.fn(),
  updateEventAction: jest.fn(),
  deleteEventAction: jest.fn().mockResolvedValue({ success: true, data: { id: 'event-123' } }),
}));

jest.mock('@/features/admin/actions/course.actions', () => ({
  createCourseAction: jest.fn(),
  updateCourseAction: jest.fn(),
  deleteCourseAction: jest.fn().mockResolvedValue({ success: true, data: { id: 'course-123' } }),
}));

const mockOnlineEvent: AdminEvent = {
  id: 'event-123',
  title: 'Taller de Inteligencia Artificial',
  description: 'Aprende a integrar herramientas de IA en tu planeación docente.',
  date: '2026-11-20T00:00:00.000Z',
  time: '18:00 - 20:00 hrs',
  modality: 'ONLINE',
  category: 'tecnologia',
  platform: 'Zoom',
  image: '/images/events/ia.jpg',
  isActive: true,
  profile: 'Docentes de educación básica',
  objective: 'Diseñar actividades apoyadas en IA',
  duration: '2 horas',
  participants: 'Máximo 50 participantes',
  requirements: 'Laptop con conexión a internet',
};

const mockInPersonDraftEvent: AdminEvent = {
  id: 'event-456',
  title: 'Conferencia de Inclusión Educativa',
  description: 'Estrategias pedagógicas para el aula inclusiva y diversa.',
  date: '2026-12-05T00:00:00.000Z',
  time: '10:00 - 13:00 hrs',
  modality: 'IN_PERSON',
  category: 'educacion',
  location: 'Auditorio Benito Juárez',
  address: 'Av. Hidalgo 100, Col. Centro',
  image: '/images/events/inclusion.jpg',
  isActive: false,
  profile: 'Público general y directivos',
  objective: 'Fomentar la inclusión escolar',
  duration: '3 horas',
  participants: '100 personas',
  requirements: 'Ninguno',
};

describe('CRUD Visual de Eventos (MV-32)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AdminEventCard', () => {
    it('renderiza título, descripción, horario, modalidad y estado publicado correctamente', () => {
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(
        <AdminEventCard
          event={mockOnlineEvent}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );

      expect(screen.getByText('Taller de Inteligencia Artificial')).toBeInTheDocument();
      expect(screen.getByText(/Aprende a integrar herramientas de IA/i)).toBeInTheDocument();
      expect(screen.getByText('18:00 - 20:00 hrs')).toBeInTheDocument();
      expect(screen.getByText('En línea')).toBeInTheDocument();
      expect(screen.getByText('Zoom')).toBeInTheDocument();
      expect(screen.getByText('Publicado')).toBeInTheDocument();
      expect(screen.getByText(/tecnologia/i)).toBeInTheDocument();
    });

    it('renderiza estado de borrador y ubicación para evento presencial', () => {
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(
        <AdminEventCard
          event={mockInPersonDraftEvent}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );

      expect(screen.getByText('Conferencia de Inclusión Educativa')).toBeInTheDocument();
      expect(screen.getByText('Presencial')).toBeInTheDocument();
      expect(screen.getByText('Auditorio Benito Juárez')).toBeInTheDocument();
      expect(screen.getByText('Borrador')).toBeInTheDocument();
    });

    it('ejecuta onEdit y onDelete al pulsar los botones respectivos', () => {
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(
        <AdminEventCard
          event={mockOnlineEvent}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /editar taller de inteligencia artificial/i }));
      expect(handleEdit).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /eliminar taller de inteligencia artificial/i }));
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('DeleteConfirmModal para Eventos', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      const handleClose = jest.fn();
      const handleDeleted = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={false}
          event={mockOnlineEvent}
          onClose={handleClose}
          onDeleted={handleDeleted}
        />
      );

      expect(screen.queryByText(/¿Eliminar evento\?/i)).not.toBeInTheDocument();
    });

    it('muestra el nombre del evento y cancela al hacer clic en Cancelar', () => {
      const handleClose = jest.fn();
      const handleDeleted = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={true}
          event={mockOnlineEvent}
          onClose={handleClose}
          onDeleted={handleDeleted}
        />
      );

      expect(screen.getByText(/¿Eliminar evento\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Taller de Inteligencia Artificial/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('llama a deleteEventAction y notifica onDeleted al confirmar eliminación física', async () => {
      const handleClose = jest.fn();
      const handleDeleted = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={true}
          event={mockOnlineEvent}
          onClose={handleClose}
          onDeleted={handleDeleted}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /eliminar evento/i }));

      await waitFor(() => {
        expect(handleDeleted).toHaveBeenCalledWith('event-123');
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('EventModal', () => {
    it('renderiza formulario limpio en modo creación', () => {
      const handleClose = jest.fn();
      const handleSaved = jest.fn();

      render(
        <EventModal
          isOpen={true}
          eventToEdit={null}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      );

      expect(screen.getByText('Crear Nuevo Evento')).toBeInTheDocument();
      const titleInput = screen.getByPlaceholderText(/Ej. Taller de Inteligencia Artificial para Docentes/i);
      expect(titleInput).toHaveValue('');
    });

    it('precarga los datos del evento al editar', () => {
      const handleClose = jest.fn();
      const handleSaved = jest.fn();

      render(
        <EventModal
          isOpen={true}
          eventToEdit={mockOnlineEvent}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      );

      expect(screen.getByText(/Editar Evento: Taller de Inteligencia Artificial/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Taller de Inteligencia Artificial')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Aprende a integrar herramientas de IA en tu planeación docente.')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('18:00 - 20:00 hrs')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Zoom')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Docentes de educación básica')).toBeInTheDocument();
    });

    it('permite cambiar a modalidad presencial y muestra campos de ubicación', () => {
      const handleClose = jest.fn();
      const handleSaved = jest.fn();

      render(
        <EventModal
          isOpen={true}
          eventToEdit={mockInPersonDraftEvent}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      );

      expect(screen.getByDisplayValue('Auditorio Benito Juárez')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Av. Hidalgo 100, Col. Centro')).toBeInTheDocument();
    });

    it('guarda los cambios llamando a updateEventAction en modo edición', async () => {
      const handleClose = jest.fn();
      const handleSaved = jest.fn();
      (updateEventAction as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockOnlineEvent, title: 'Taller de IA Modificado' },
      });

      render(
        <EventModal
          isOpen={true}
          eventToEdit={mockOnlineEvent}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      );

      const titleInput = screen.getByDisplayValue('Taller de Inteligencia Artificial');
      fireEvent.change(titleInput, { target: { value: 'Taller de IA Modificado' } });

      fireEvent.click(screen.getByRole('button', { name: /actualizar evento/i }));

      await waitFor(() => {
        expect(updateEventAction).toHaveBeenCalledWith(
          'event-123',
          expect.objectContaining({
            title: 'Taller de IA Modificado',
          })
        );
        expect(handleSaved).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'Taller de IA Modificado' })
        );
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it('crea un nuevo evento llamando a createEventAction en modo creación', async () => {
      const handleClose = jest.fn();
      const handleSaved = jest.fn();
      const newEventData: AdminEvent = {
        ...mockOnlineEvent,
        id: 'new-event-789',
        title: 'Nuevo Seminario Web',
      };
      (createEventAction as jest.Mock).mockResolvedValue({
        success: true,
        data: newEventData,
      });

      render(
        <EventModal
          isOpen={true}
          eventToEdit={null}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Ej. Taller de Inteligencia Artificial para Docentes/i);
      fireEvent.change(titleInput, { target: { value: 'Nuevo Seminario Web' } });

      const descInput = screen.getByPlaceholderText(/Describe de qué trata el evento/i);
      fireEvent.change(descInput, { target: { value: 'Descripción completa del seminario web' } });

      // Seleccionar fecha
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2026-11-25' } });

      fireEvent.click(screen.getByRole('button', { name: /guardar evento/i }));

      await waitFor(() => {
        expect(createEventAction).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Nuevo Seminario Web',
            description: 'Descripción completa del seminario web',
            date: '2026-11-25',
          })
        );
        expect(handleSaved).toHaveBeenCalledWith(newEventData);
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });
  });
});
