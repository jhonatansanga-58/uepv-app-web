/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin');
const serviceAccount = require('../../service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    ignoreUndefinedProperties: true,
  });
}

const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    // Validación preventiva
    if (!token || token.trim() === '') {
      console.log('Token vacío, no se envía notificación.');
      return false;
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data, // Aquí van IDs o rutas para que la app sepa qué abrir
      token: token,
    };

    const response = await admin.messaging().send(message);
    console.log('Notificación enviada:', response);

    return true;
  } catch (error) {
    console.error('Error enviando notificación:', error);

    if (error.code === 'messaging/registration-token-not-registered') {
      console.log('El token ya no es válido, deberíamos borrarlo de la DB');
      // await db.DeviceToken.destroy({ where: { token } });
    }
    return false;
  }
};

const sendMulticast = async (tokens, title, body, data = {}) => {
  try {
    // Validación preventiva
    if (!Array.isArray(tokens) || tokens.length === 0) return;

    const message = {
      notification: { title, body, },
      data,
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Notificación enviada:', response);

    return true;
  } catch (error) {
    console.error('Error enviando notificación:', error);

    if (error.code === 'messaging/registration-token-not-registered') {
      console.log('El token ya no es válido, deberíamos borrarlo de la DB');
      // await db.DeviceToken.destroy({ where: { token } });
    }
    return false;
  }
};

module.exports = { sendPushNotification, sendMulticast };