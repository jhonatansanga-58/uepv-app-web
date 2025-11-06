import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { LoginResponse, User } from '../types/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const AuthService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/mobile/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usernameOrEmail, password }),
      });
      const data = await response.json();

      const { token, user } = await data;
console.log('Login successful:', data);
      // Store token and user data securely
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      return { token, user };
    } catch (error) {
      // eslint-disable-next-line import/no-named-as-default-member
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Login failed');
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },
};