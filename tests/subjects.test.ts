import { PUT } from '@/app/api/users/[userId]/subjects/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    teacherSubject: { deleteMany: jest.fn(), createMany: jest.fn() }
  }
}));

describe('Integración: Asignación de Materias a Profesor', () => {
  it('Debe limpiar asignaciones previas y crear las nuevas mediante operaciones bulk del ORM', async () => {
    const mockRequest = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ subjectIds: [101, 102] })
    });
    const params = Promise.resolve({ userId: '42' });

    await PUT(mockRequest as any, { params });

    expect(prisma.teacherSubject.deleteMany).toHaveBeenCalledWith({
      where: { teacherId: 42 }
    });
    expect(prisma.teacherSubject.createMany).toHaveBeenCalledWith({
      data: [
        { teacherId: 42, subjectId: 101 },
        { teacherId: 42, subjectId: 102 }
      ]
    });
  });
});
