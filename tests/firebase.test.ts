import { sendPushNotification } from '@/lib/firebaseNotificationService';
import admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
  return {
    messaging: jest.fn().mockReturnValue({
      send: jest.fn()
    })
  };
});

describe('Integración Push Notifications FCM', () => {
  it('Debe estructurar el payload FCM y retornar un MessageId exitoso desde Firebase', async () => {
    const targetFirebaseToken = 'fcm_token_device_abc123';
    const notificationPayload = {
      title: 'Registro de Asistencia',
      body: 'El estudiante Juan Pérez ha registrado su entrada exitosamente.'
    };

    const mockFirebaseResponse = 'projects/uepv-app/messages/0:1234567890';
    (admin.messaging().send as jest.Mock).mockResolvedValue(mockFirebaseResponse);

    const result = await sendPushNotification(
      targetFirebaseToken, 
      notificationPayload.title, 
      notificationPayload.body
    );

    expect(admin.messaging().send).toHaveBeenCalledWith({
      token: targetFirebaseToken,
      notification: {
        title: notificationPayload.title,
        body: notificationPayload.body
      }
    });

    expect(result).toEqual({
      success: true,
      messageId: mockFirebaseResponse
    });
  });
});
