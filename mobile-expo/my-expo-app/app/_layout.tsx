import { useEffect } from 'react';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { AuthService } from '../services/auth';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

function useProtectedRoute() {
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthService.isAuthenticated();

      const inAuthGroup = segments[0] === 'auth';
      const isRoot = pathname === '/';

      if (!isAuth && !inAuthGroup) {
        router.replace('/auth');
      } else if (isAuth && (inAuthGroup || isRoot)) {
        router.replace('/(main)/(drawer)/(notices)/comunicados');
      }
    };

    checkAuth();
  }, [segments, pathname, router]);
}
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
}

export default function RootLayout() {
  console.log("api url:", process.env.EXPO_PUBLIC_API_URL);
  useProtectedRoute();

  useEffect(() => {
    const initFCM = async () => {
      const allowed = await requestUserPermission();

      if (!allowed) {
        Alert.alert("Permission denied");
        return;
      }

      const token = await messaging().getToken();
      console.log("FCM Token:", token);

      // 👉 recomendado: envía este token a tu backend DESPUÉS del login
    };

    initFCM();

    // When app is opened from quit
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Initial notification caused app from quit state:',
            remoteMessage.notification
          );
        }
      });

    // When app is opened from background
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification caused app to open from background state:',
        remoteMessage.notification
      );
    });

    // Background handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    });

    // Foreground messages
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', JSON.stringify(remoteMessage));
      Alert.alert(remoteMessage.notification?.title || '',
        remoteMessage.notification?.body || ''
      );
    });

    return unsubscribe;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}