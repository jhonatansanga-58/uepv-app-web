import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../services/auth';
import messaging from '@react-native-firebase/messaging';

export default function LoginScreen() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const isAuth = await AuthService.isAuthenticated();
        if (isAuth) {
          router.replace('/(main)/(drawer)/(notices)/comunicados');
        }
      } catch {
        // ignore
      }
    };
    check();
  }, [router]);

  const handleLogin = async () => {
    if (!usernameOrEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login', { usernameOrEmail });
      const resp = await AuthService.login(usernameOrEmail, password);
      console.log('Login successful', resp);

      // Get Firebase token and send to backend
      try {
        const firebaseToken = await messaging().getToken();
        console.log('Firebase token:', firebaseToken);

        const token = await AuthService.getToken();
        const user = await AuthService.getCurrentUser();

        if (user?.id && firebaseToken) {
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mobile/firebase-token`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              firebaseToken,
            }),
          });

          if (!res.ok) {
            console.warn('Failed to save Firebase token to backend', await res.text());
          } else {
            console.log('Firebase token saved to backend successfully');
          }
        }
      } catch (err) {
        console.warn('Error getting or saving Firebase token', err);
      }

      router.replace('/(main)/(drawer)/(notices)/comunicados');
    } catch (error) {
      console.log(
        'Login Failed',
        error instanceof Error ? error.message : 'Please check your credentials'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <View className="flex-1 justify-center space-y-6 p-6">
        <View className="mb-8 items-center">
          <Image
            source={require('../../assets/escudo.png')}
            className={Platform.OS === 'web' ? 'mb-4 max-h-36 max-w-36' : 'mb-4 h-40 w-40'}
            resizeMode="contain"
          />
        </View>

        <View className="space-y-4">
          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Usuario o correo</Text>
            <TextInput
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500"
              placeholder="Ingresa tu nombre de usuario o correo"
              value={usernameOrEmail}
              onChangeText={setUsernameOrEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="my-3 mb-1 text-sm font-medium text-gray-700">Contraseña</Text>
            <TextInput
              className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`my-4 w-full rounded-lg bg-primary-500 py-3 ${isLoading ? 'opacity-70' : ''}`}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">iniciar sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
