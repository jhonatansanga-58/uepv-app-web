import { useEffect } from 'react';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { AuthService } from '../services/auth';

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

export default function RootLayout() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}