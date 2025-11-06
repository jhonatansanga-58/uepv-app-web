import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../services/auth';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await AuthService.logout();
    router.replace('/auth/login');
  };

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Home Screen</Text>
      <Text className="text-base text-gray-600 mb-8">
        You are now logged in successfully!
      </Text>
      
      <TouchableOpacity
        onPress={handleLogout}
        className="py-3 px-6 bg-red-600 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}