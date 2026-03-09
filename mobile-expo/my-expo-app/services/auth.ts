import * as SecureStore from 'expo-secure-store';
import messaging from '@react-native-firebase/messaging';
import { LoginResponse, User } from '../types/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

async function secureSetItem(key: string, value: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  } catch {
    throw new Error('No secure storage available');
  }
}

async function secureGetItem(key: string): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureDeleteItem(key: string): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
    return;
  }
  return SecureStore.deleteItemAsync(key);
}

function decodeJwt(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const AuthService = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/mobile/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message = data?.error || data?.message || 'Login failed';
      throw new Error(message);
    }

    const token: string = data?.token;
    const user: User = data?.user;

    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

    await secureSetItem(TOKEN_KEY, token);
    await secureSetItem(USER_KEY, JSON.stringify(user));

    return { token, user };
  },

  async logout(): Promise<void> {
    try {
      // Delete Firebase token from device
      try {
        await messaging().deleteToken();
        console.log('Firebase token deleted from device');
      } catch (err) {
        console.warn('Failed to delete Firebase token from device', err);
      }

      // Send empty token to backend to clear Firebase token
      const token = await secureGetItem(TOKEN_KEY);
      const userData = await secureGetItem(USER_KEY);
      const user = userData ? (JSON.parse(userData) as User) : null;
      
      if (token && user?.id) {
        try {
          await fetch(`${API_URL}/mobile/firebase-token`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              firebaseToken: '',
            }),
          });
        } catch (err) {
          console.warn('Failed to clear Firebase token on backend', err);
        }
      }
    } catch (err) {
      console.warn('Error during logout cleanup', err);
    } finally {
      // Always clear local storage even if backend call fails
      await secureDeleteItem(TOKEN_KEY);
      await secureDeleteItem(USER_KEY);
    }
  },

  async getToken(): Promise<string | null> {
    return secureGetItem(TOKEN_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    const userData = await secureGetItem(USER_KEY);
    return userData ? (JSON.parse(userData) as User) : null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return false;

    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      await this.logout();
      return false;
    }

    return true;
  },
};