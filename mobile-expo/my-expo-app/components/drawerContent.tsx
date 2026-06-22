import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router'; // Para manejar la navegación
import { AuthService } from 'services/auth';
import { useEffect, useState } from 'react';

const DrawerContent = (props: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  const handleLoginLogout = async () => {
    if (isAuthenticated) {
      console.log('Cerrando sesión...');
      await AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
      // Force a small delay to ensure SecureStore is cleared before navigation
      setTimeout(() => {
        router.replace('auth');
      }, 100);
    } else {
      router.replace('auth');
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAuth = await AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (!isAuth) {
        setUser(null);
        return;
      }
      const current = await AuthService.getCurrentUser();
      setUser(current?.name || null);
    };
    init();
  }, [router]);

  const goTo = (path: string) => router.push(path);

  return (
    <View className="flex-1">
      <View className="mt-16 items-center border-b border-gray-200 p-4">
        <Image
          source={require('assets/escudo.png')}
          className={Platform.OS === 'web' ? 'mb-4 max-h-20 max-w-20' : 'mb-4 h-20 w-20'}
        />
        <Text className="text-center text-lg font-bold">Bienvenido {user}</Text>
      </View>

      <DrawerContentScrollView {...props}>
        <TouchableOpacity
          className="mb-2 rounded-xl bg-primary-100 px-4 py-3"
          onPress={() => goTo('/(main)/(drawer)/attendances')}>
          <Text className="text-base text-primary-600">Asistencias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mb-2 rounded-xl bg-primary-100 px-4 py-3"
          onPress={() => goTo('/(main)/(drawer)/(notices)/comunicados')}>
          <Text className="text-base text-primary-600">Comunicados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mb-2 rounded-xl bg-primary-100 px-4 py-3"
          onPress={() => goTo('/(main)/(drawer)/(licences)/licencias')}>
          <Text className="text-base text-primary-600">Licencias</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>

      <View className="border-t border-gray-200 p-4">
        <TouchableOpacity className="rounded-lg bg-primary-500  p-3" onPress={handleLoginLogout}>
          <Text className="text-center font-bold text-white">
            {isAuthenticated ? 'Cerrar Sesión' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DrawerContent;
