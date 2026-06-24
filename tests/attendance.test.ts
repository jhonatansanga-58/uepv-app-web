import { POST } from '@/app/api/attendance/route';
import { prisma } from '@/lib/prisma';
import { sendMulticast } from '@/utils/notifications';
import { getToken } from 'next-auth/jwt';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    student: { findUnique: jest.fn() },
    attendance: { create: jest.fn() },
    studentTutor: { findMany: jest.fn() }
  }
}));
jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
jest.mock('@/utils/notifications', () => ({ sendMulticast: jest.fn().mockResolvedValue(true) }));

describe('Integración: Registro de Asistencia y Despacho al Tutor', () => {
  it('Debe extraer el FirebaseToken del tutor y enviar la notificación al marcar asistencia', async () => {
    (getToken as jest.Mock).mockResolvedValue({ sub: '1', role: 'ADMIN' });

    const mockStudentId = 15;
    const mockRequest = new Request('http://localhost/api/attendance', {
      method: 'POST',
      body: JSON.stringify({ studentId: mockStudentId })
    });

    (prisma.student.findUnique as jest.Mock).mockResolvedValue({ id: mockStudentId, user: { active: true } });
    
    const mockAttendanceData = { 
      id: 99, studentId: mockStudentId, date: new Date(),
      student: { user: { firstName: 'Juan', lastName: 'Pérez' } }
    };
    (prisma.attendance.create as jest.Mock).mockResolvedValue(mockAttendanceData);

    const mockTutors = [{ tutor: { id: 20, firebaseToken: 'token_fcm_padre123' } }];
    (prisma.studentTutor.findMany as jest.Mock).mockResolvedValue(mockTutors);

    await POST(mockRequest as any);

    expect(prisma.studentTutor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: mockStudentId } })
    );
    expect(sendMulticast).toHaveBeenCalledWith(
      ['token_fcm_padre123'],
      'Asistencia Registrada',
      expect.stringContaining('Se registró asistencia para Juan Pérez'),
      expect.any(Object)
    );
  });
});
