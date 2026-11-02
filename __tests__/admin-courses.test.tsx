import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminCourseCard from '@/features/admin/components/AdminCourseCard';
import DeleteConfirmModal from '@/features/admin/components/DeleteConfirmModal';
import CourseModal from '@/features/admin/components/CourseModal';
import type { AdminCourse } from '@/features/admin/types/course.types';

// Mock server actions
jest.mock('@/features/admin/actions/course.actions', () => ({
  createCourseAction: jest.fn(),
  updateCourseAction: jest.fn(),
  deleteCourseAction: jest.fn().mockResolvedValue({ success: true, data: { id: 'course-123' } }),
}));

const mockCourse: AdminCourse = {
  id: 'course-123',
  slug: 'curso-test',
  title: 'Curso de Prueba',
  shortDescription: 'Descripción corta de prueba',
  description: 'Descripción completa para el curso de prueba',
  duration: '10 hrs',
  modality: 'Presencial',
  type: 'CURSO',
  stage: '1',
  categories: ['Tecnología'],
  skills: ['React'],
  image: '/images/courses/test.jpg',
  color: '#2563EB',
  backgroundPattern: 'GRID',
  featured: true,
  clickable: true,
  isActive: true,
  participants: '10 - 15 participantes',
  targetAudience: 'General',
  objective: 'Aprender',
  requirements: 'Ninguno',
};

describe('CRUD Visual de Cursos (MV-21)', () => {
  describe('AdminCourseCard', () => {
    it('renderiza el título, descripción, duración y etiquetas de estado correctamente', () => {
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(
        <AdminCourseCard
          course={mockCourse}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );

      expect(screen.getByText('Curso de Prueba')).toBeInTheDocument();
      expect(screen.getByText('Descripción corta de prueba')).toBeInTheDocument();
      expect(screen.getByText('10 hrs')).toBeInTheDocument();
      expect(screen.getByText('Presencial')).toBeInTheDocument();
      expect(screen.getByText('Publicado')).toBeInTheDocument();
      expect(screen.getByText('Destacado')).toBeInTheDocument();
    });

    it('ejecuta onEdit y onDelete al pulsar los botones respectivos', () => {
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(
        <AdminCourseCard
          course={mockCourse}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /editar curso de prueba/i }));
      expect(handleEdit).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /eliminar curso de prueba/i }));
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('DeleteConfirmModal', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      const handleClose = jest.fn();
      const handleDeleted = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={false}
          course={mockCourse}
          onClose={handleClose}
          onDeleted={handleDeleted}
        />
      );

      expect(screen.queryByText(/¿Eliminar curso\?/i)).not.toBeInTheDocument();
    });

    it('muestra el nombre del curso y cancela al hacer clic en Cancelar', () => {
      const handleClose = jest.fn();
      const handleDeleted = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={true}
          course={mockCourse}
          onClose={handleClose}
          onDeleted={handleDeleted}
        />
      );

      expect(screen.getByText(/¿Eliminar curso\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Curso de Prueba/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('llama a eliminar curso y notifica onDeleted al confirmar', async () => {
      const handleClose = jest.fn();
      const handleDeleted = jest.fn();

      render(
        <DeleteConfirmModal
          isOpen={true}
          course={mockCourse}
          onClose={handleClose}
          onDeleted={handleDeleted}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /eliminar curso/i }));

      await waitFor(() => {
        expect(handleDeleted).toHaveBeenCalledWith('course-123');
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('CourseModal', () => {
    it('autogenera el slug a partir del título en modo creación', () => {
      const handleClose = jest.fn();
      const handleSaved = jest.fn();

      render(
        <CourseModal
          isOpen={true}
          courseToEdit={null}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Ej. Microsoft Excel Avanzado/i);
      const slugInput = screen.getByPlaceholderText(/ej. microsoft-excel-avanzado/i);

      fireEvent.change(titleInput, { target: { value: 'Nuevo Curso de Python 2026' } });

      expect(slugInput).toHaveValue('nuevo-curso-de-python-2026');
    });

    it('precarga los datos del curso al editar', () => {
      const handleClose = jest.fn();
      const handleSaved = jest.fn();

      render(
        <CourseModal
          isOpen={true}
          courseToEdit={mockCourse}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      );

      expect(screen.getByDisplayValue('Curso de Prueba')).toBeInTheDocument();
      expect(screen.getByDisplayValue('curso-test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Descripción corta de prueba')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Descripción completa para el curso de prueba')).toBeInTheDocument();
    });
  });
});
