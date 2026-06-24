import { POST } from '@/app/api/notices/notifications/route';
import { prisma } from '@/lib/prisma';
import { sendMulticast } from '@/utils/notifications';
import { getToken } from 'next-auth/jwt';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: { create: jest.fn() },
    enrollment: { findMany: jest.fn() }
  }
}));
jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
jest.mock('@/utils/notifications', () => ({ sendMulticast: jest.fn().mockResolvedValue(true) }));

describe('Integración: Avisos Escolares y Destinatarios (Firebase)', () => {
  it('Debe extraer iterativamente tokens de estudiantes y tutores de un paralelo para el Multicast', async () => {
    (getToken as jest.Mock).mockResolvedValue({ sub: '1', role: 'ADMIN' });
    
    const mockRequest = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ title: 'Reunión', message: 'Mañana a las 8', courseParallelId: 5 })
    });

    (prisma.notification.create as jest.Mock).mockResolvedValue({ id: 10 });
    
    (prisma.enrollment.findMany as jest.Mock).mockResolvedValue([
      { 
        student: { 
          user: { firebaseToken: 'token_fcm_estudiante' },
          tutorships: [{ tutor: { firebaseToken: 'token_fcm_tutor' } }]
        } 
      }
    ]);

    await POST(mockRequest as any);

    expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ 
        where: expect.objectContaining({ courseParallelId: 5 }) 
      })
    );
    expect(sendMulticast).toHaveBeenCalledWith(
      ['token_fcm_estudiante', 'token_fcm_tutor'],
      'Reunión',
      'Mañana a las 8',
      expect.any(Object)
    );
  });
});
