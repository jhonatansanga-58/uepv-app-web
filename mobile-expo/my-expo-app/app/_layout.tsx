import { useEffect } from 'react';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { AuthService } from '../services/auth';
import messaging from '@react-native-firebase/messaging';

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
        router.replace('auth');
      } else if (isAuth && (inAuthGroup || isRoot)) {
        router.replace('/(main)/(drawer)/(notices)/comunicados');
      }
    };

    checkAuth();
  }, [segments, pathname, router]);
}
export default function RootLayout() {
  useProtectedRoute();

  useEffect(() => {
    // When app is opened from quit
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            'Initial notification caused app from quit state:',
            remoteMessage.notification
          );
        }
      });

    // When app is opened from background
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
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
    });

    return unsubscribe;
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
