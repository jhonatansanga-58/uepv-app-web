/*import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AuthService } from 'services/auth';

// Notification handler for foreground behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationToken = string;

export async function registerForPushNotificationsAsync(): Promise<NotificationToken | null> {
  try {
    if (!Device.isDevice) {
      console.log('registerForPushNotificationsAsync: must use physical device');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('registerForPushNotificationsAsync: permission not granted');
      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      // If you use EAS and a projectId, keep it here. Otherwise this can be omitted.
      projectId: '9f3ea326-ab0b-4551-81d5-a3672ee522e8',
    });

    const token = tokenResponse.data;
    console.log('registerForPushNotificationsAsync: token', token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.error('registerForPushNotificationsAsync error', error);
    return null;
  }
}

export async function saveTokenToBackend(token: NotificationToken): Promise<boolean> {
  try {
    const authToken = await AuthService.getToken();
    /*const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mobile/notificationtoken`, {
      method: 'POST',
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      console.error('saveTokenToBackend failed', await res.text());
      return false;
    }*
    return true;
  } catch (err) {
    console.error('saveTokenToBackend error', err);
    return false;
  }
}

export async function registerAndSavePushToken(): Promise<NotificationToken | null> {
  const token = await registerForPushNotificationsAsync();
  if (!token) return null;
  const ok = await saveTokenToBackend(token);
  if (!ok) console.warn('registerAndSavePushToken: failed to save token to backend');
  return token;
}

export function initNotificationListeners(options?: {
  onReceive?: (notification: Notifications.Notification) => void;
  onResponse?: (response: Notifications.NotificationResponse) => void;
}) {
  const receiveSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received', notification);
    options?.onReceive?.(notification);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification response', response);
    options?.onResponse?.(response);
  });

  return () => {
    receiveSub.remove();
    responseSub.remove();
  };
}

export default {
  registerForPushNotificationsAsync,
  saveTokenToBackend,
  registerAndSavePushToken,
  initNotificationListeners,
};
*/