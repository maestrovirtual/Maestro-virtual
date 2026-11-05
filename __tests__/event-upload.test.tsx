import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventModal from '@/features/admin/components/EventModal';
import { createEventAction } from '@/features/admin/actions/event.actions';
import { validateImageFile, MAX_IMAGE_SIZE } from '@/lib/storage';

// Mock server actions
jest.mock('@/features/admin/actions/event.actions', () => ({
  createEventAction: jest.fn(),
  updateEventAction: jest.fn(),
  deleteEventAction: jest.fn(),
}));

describe('Subida de Archivos y Portadas para Eventos (Refactorización MV-32)', () => {
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  beforeAll(() => {
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:http://localhost:3000/mock-preview-id');
    URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UI del Formulario (EventModal)', () => {
    it('renderiza un input de tipo file con accept="image/*"', () => {
      render(
        <EventModal
          isOpen={true}
          eventToEdit={null}
          onClose={jest.fn()}
          onSaved={jest.fn()}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).not.toBeNull();
      expect(fileInput).toHaveAttribute('accept', 'image/*');
      expect(fileInput).toHaveAttribute('name', 'image');
    });

    it('genera preview con URL.createObjectURL al seleccionar una imagen válida', async () => {
      render(
        <EventModal
          isOpen={true}
          eventToEdit={null}
          onClose={jest.fn()}
          onSaved={jest.fn()}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['dummy-content'], 'portada.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
      await waitFor(() => {
        expect(screen.getByText(/Archivo seleccionado: portada\.png/i)).toBeInTheDocument();
        const previewImg = screen.getByAltText(/Vista previa de portada/i);
        expect(previewImg).toHaveAttribute('src', 'blob:http://localhost:3000/mock-preview-id');
      });
    });

    it('muestra error y no genera preview si el archivo excede los 5MB', async () => {
      render(
        <EventModal
          isOpen={true}
          eventToEdit={null}
          onClose={jest.fn()}
          onSaved={jest.fn()}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const bigFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'muy-pesada.jpg', {
        type: 'image/jpeg',
      });

      fireEvent.change(fileInput, { target: { files: [bigFile] } });

      await waitFor(() => {
        expect(screen.getByText(/La imagen no debe superar los 5MB/i)).toBeInTheDocument();
      });
    });

    it('envía FormData a createEventAction al guardar el formulario con imagen', async () => {
      const handleSaved = jest.fn();
      const mockResultEvent = {
        id: 'new-ev-1',
        title: 'Taller con Portada',
        description: 'Descripción del evento con imagen',
        image: 'https://storage.supabase.co/events/portada.png',
        date: new Date('2026-12-01'),
        modality: 'ONLINE' as const,
        category: 'general',
        isActive: true,
      };

      (createEventAction as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResultEvent,
      });

      render(
        <EventModal
          isOpen={true}
          eventToEdit={null}
          onClose={jest.fn()}
          onSaved={handleSaved}
        />
      );

      // Campos requeridos
      fireEvent.change(screen.getByPlaceholderText(/Ej\. Taller de Inteligencia Artificial/i), {
        target: { value: 'Taller con Portada' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Describe de qué trata el evento/i), {
        target: { value: 'Descripción del evento con imagen' },
      });
      fireEvent.change(document.querySelector('input[type="date"]')!, {
        target: { value: '2026-12-01' },
      });

      // Subir archivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['image-bytes'], 'banner.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Guardar
      fireEvent.click(screen.getByRole('button', { name: /guardar evento/i }));

      await waitFor(() => {
        expect(createEventAction).toHaveBeenCalledTimes(1);
        const passedArg = (createEventAction as jest.Mock).mock.calls[0][0];
        expect(passedArg).toBeInstanceOf(FormData);
        expect(passedArg.get('title')).toBe('Taller con Portada');
        expect(passedArg.get('image')).toBe(file);
        expect(handleSaved).toHaveBeenCalledWith(mockResultEvent);
      });
    });

    it('renderiza un segundo input file para patrocinadores y lo adjunta en el FormData', async () => {
      const mockResultEvent = {
        id: 'new-id-2',
        title: 'Taller con Patrocinadores',
        description: 'Descripción con aliados',
        date: new Date('2026-11-20'),
        time: '10:00 - 12:00 hrs',
        modality: 'ONLINE',
        category: 'general',
        image: '/images/events/default.jpg',
        sponsorsImageUrl: 'https://supabase.co/sponsors.png',
        isActive: true,
      };

      (createEventAction as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResultEvent,
      });

      render(
        <EventModal
          isOpen={true}
          eventToEdit={null}
          onClose={jest.fn()}
          onSaved={jest.fn()}
        />
      );

      // Comprobar que existe la etiqueta e input de patrocinadores
      expect(screen.getByText(/Imagen de Patrocinadores \/ Extra/i)).toBeInTheDocument();
      const sponsorsInput = document.querySelector('input[name="sponsorsImage"]') as HTMLInputElement;
      expect(sponsorsInput).not.toBeNull();
      expect(sponsorsInput).toHaveAttribute('accept', 'image/*');

      // Seleccionar archivo de patrocinadores
      const sponsorsFile = new File(['sponsors-bytes'], 'aliados.png', { type: 'image/png' });
      fireEvent.change(sponsorsInput, { target: { files: [sponsorsFile] } });

      expect(URL.createObjectURL).toHaveBeenCalledWith(sponsorsFile);
      expect(screen.getByText(/Archivo seleccionado: aliados\.png/i)).toBeInTheDocument();

      // Completar campos obligatorios
      fireEvent.change(screen.getByPlaceholderText(/Ej\. Taller de Inteligencia Artificial/i), {
        target: { value: 'Taller con Patrocinadores' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Describe de qué trata el evento/i), {
        target: { value: 'Descripción con aliados' },
      });
      fireEvent.change(document.querySelector('input[type="date"]')!, {
        target: { value: '2026-12-01' },
      });

      // Guardar
      fireEvent.click(screen.getByRole('button', { name: /guardar evento/i }));

      await waitFor(() => {
        expect(createEventAction).toHaveBeenCalledTimes(1);
        const passedArg = (createEventAction as jest.Mock).mock.calls[0][0];
        expect(passedArg).toBeInstanceOf(FormData);
        expect(passedArg.get('sponsorsImage')).toBe(sponsorsFile);
      });
    });
  });

  describe('Validaciones de Storage (validateImageFile)', () => {
    it('acepta formatos de imagen estándar y rechaza archivos no soportados', () => {
      const validJpg = new File(['content'], 'foto.jpg', { type: 'image/jpeg' });
      const validWebp = new File(['content'], 'foto.webp', { type: 'image/webp' });
      const invalidPdf = new File(['content'], 'documento.pdf', { type: 'application/pdf' });

      expect(validateImageFile(validJpg).valid).toBe(true);
      expect(validateImageFile(validWebp).valid).toBe(true);
      expect(validateImageFile(invalidPdf).valid).toBe(false);
      expect(validateImageFile(invalidPdf).error).toMatch(/imagen válida/i);
    });

    it('rechaza archivos que exceden MAX_IMAGE_SIZE (5MB)', () => {
      const oversized = new File([new ArrayBuffer(MAX_IMAGE_SIZE + 1024)], 'grande.png', {
        type: 'image/png',
      });
      const result = validateImageFile(oversized);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/excede el tamaño máximo/i);
    });
  });
});
