import * as SecureStore from 'expo-secure-store';
import { LoginResponse, User } from '../types/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Small runtime-safe wrapper for secure storage. Some environments (or older/newer
// versions) expose different method names; also provide a localStorage fallback
// for web so the app doesn't crash in browser testing.
async function secureSetItem(key: string, value: string): Promise<void> {
  // prefer standard API
  /*if ((SecureStore as any).setItemAsync) {
    return (SecureStore as any).setItemAsync(key, value);
  }*/

  // older or alternate implementations
  /*if ((SecureStore as any).setValueWithKeyAsync) {
    return (SecureStore as any).setValueWithKeyAsync(key, value);
  }*/

  // fallback to browser localStorage
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
  /*if ((SecureStore as any).getItemAsync) {
    return (SecureStore as any).getItemAsync(key);
  }*/
  /*if ((SecureStore as any).getValueWithKeyAsync) {
    return (SecureStore as any).getValueWithKeyAsync(key);
  }*/
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
  /*if ((SecureStore as any).deleteItemAsync) {
    return (SecureStore as any).deleteItemAsync(key);
  }*/
  /*if ((SecureStore as any).deleteValueWithKeyAsync) {
    return (SecureStore as any).deleteValueWithKeyAsync(key);
  }*/
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
    return;
  }
  return SecureStore.deleteItemAsync(key);
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

    // Expecting { token, user }
    const token: string = data?.token;
    const user: User = data?.user;

    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

    // Store token and user data securely (use wrapper to support different runtimes)
    await secureSetItem(TOKEN_KEY, token);
    await secureSetItem(USER_KEY, JSON.stringify(user));

    return { token, user };
  },

  async logout(): Promise<void> {
    await secureDeleteItem(TOKEN_KEY);
    await secureDeleteItem(USER_KEY);
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
    return !!token;
  },
};