import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../services/auth';
import { User } from '../../types/auth';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        router.replace('/auth');
        return;
      }

      const current = await AuthService.getCurrentUser();
      setUser(current);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await AuthService.logout();
    router.replace('/auth');
  };

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Home</Text>
      {user ? (
        <View className="mb-8">
          <Text className="text-lg text-gray-800">{user.name}</Text>
          <Text className="text-sm text-gray-600">{user.role}</Text>
        </View>
      ) : (
        <Text className="text-base text-gray-600 mb-8">Loading...</Text>
      )}

      <TouchableOpacity
        onPress={handleLogout}
        className="py-3 px-6 bg-red-600 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}