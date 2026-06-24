import admin from 'firebase-admin';

export async function sendPushNotification(token: string, title: string, body: string) {
  try {
    const response = await admin.messaging().send({
      token,
      notification: { title, body },
    });
    return {
      success: true,
      messageId: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
