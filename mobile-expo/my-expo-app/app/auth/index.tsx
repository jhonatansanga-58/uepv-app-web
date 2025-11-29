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
//import { registerAndSavePushToken } from '../../services/notifications';

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
      // register and save push token after successful login (non-blocking)
      /*try {
        await registerAndSavePushToken();
      } catch (err) {
        console.warn('Failed to register push token after login', err);
      }*/
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
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center p-6 space-y-6">
        <View className="items-center mb-8">
          <Image
            source={require('../../assets/escudo.png')}
            className= {Platform.OS === 'web' ? 'max-w-36 max-h-36 mb-4' : 'w-40 h-40 mb-4'}
            resizeMode="contain"
          />
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Usuario o correo
            </Text>
            <TextInput
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500"
              placeholder="Ingresa tu nombre de usuario o correo"
              value={usernameOrEmail}
              onChangeText={setUsernameOrEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1 my-3">
              Contraseña
            </Text>
            <TextInput
              className="w-full px-3 py-3 rounded-lg border border-gray-300 focus:border-blue-500"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`w-full my-4 py-3 rounded-lg bg-primary-500 ${isLoading ? 'opacity-70' : ''}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                iniciar sesión
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}