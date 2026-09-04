/**
 * @jest-environment node
 */


import { GET, POST } from '../../src/app/api/courses/route';
import prisma from '../../src/lib/prisma/client';

// Mock de Prisma
jest.mock(
  '../../src/lib/prisma/client',
  () => ({
    __esModule: true,
    default: {
      course: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    },
  }),
  { virtual: true }
);

describe('API /api/courses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // 👈 Silencia console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // 👈 Restaura console.error
  });


  // ==========================================
  // GET
  // ==========================================
  describe('GET /api/courses', () => {
    test('Debe retornar status 200 y la lista de cursos activos', async () => {
      const mockCourses = [{ id: '1', title: 'Curso Next.js', isActive: true }];
      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourses);
    });

    test('Debe retornar status 500 si falla la base de datos', async () => {
      (prisma.course.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Error interno del servidor al obtener los cursos' });
    });
  });

  // ==========================================
  // POST
  // ==========================================
  describe('POST /api/courses', () => {
    test('Debe retornar 400 si falta title o slug', async () => {
      const req = new Request('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify({ title: 'Solo título' }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'El título y el slug son obligatorios para crear un curso',
      });
    });

    test('Debe crear un curso exitosamente con status 201', async () => {
      const coursePayload = { title: 'Curso Nuevo', slug: 'curso-nuevo' };
      const createdMock = { id: '99', ...coursePayload };

      (prisma.course.create as jest.Mock).mockResolvedValue(createdMock);

      const req = new Request('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify(coursePayload),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMock);
    });

    test('Debe retornar 500 si falla la creación en la base de datos', async () => {
      (prisma.course.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const req = new Request('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify({ title: 'Curso', slug: 'curso' }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Error interno del servidor al crear el curso' });
    });
  });
});