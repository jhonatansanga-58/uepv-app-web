
import React, { useEffect } from 'react';
import '../global.css';
import { Redirect } from 'expo-router';
import { AuthService } from '../services/auth';

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Redirect based on auth status
  return isAuthenticated ? <Redirect href="/home" /> : <Redirect href="/auth" />;
}
