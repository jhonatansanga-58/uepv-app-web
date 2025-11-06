import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../services/auth';

export default function LoginScreen() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!usernameOrEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.login(usernameOrEmail, password);
      router.replace('/home');
    } catch (error) {
      Alert.alert(
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
        {/* Logo or Header */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-900">Welcome Back</Text>
          <Text className="text-base text-gray-600 mt-2">
            Sign in to your account
          </Text>
        </View>

        {/* Login Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </Text>
            <TextInput
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500"
              placeholder="Enter your username or email"
              value={usernameOrEmail}
              onChangeText={setUsernameOrEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Password
            </Text>
            <TextInput
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg bg-blue-600 ${isLoading ? 'opacity-70' : 'active:bg-blue-700'
              }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}