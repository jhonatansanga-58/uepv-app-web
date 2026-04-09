'use client';

import { Button, Card, Label, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { HiLockClosed, HiUser } from 'react-icons/hi';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        usernameOrEmail,
        password,
        redirect: false,
      });

      if (!result?.error) {
        // Successful login
        router.replace(callbackUrl);
      } else {
        // Show error
        console.error('Login error:', result.error);
        setError('Invalid credentials. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          {/* Replace with your actual logo */}
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            <HiUser className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Iniciar Sesión
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="usernameOrEmail">Usuario o Email</Label>
            </div>
            <TextInput
              id="usernameOrEmail"
              type="text"
              placeholder="usu123 o usuario@email.com"
              required
              icon={HiUser}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password">Contraseña</Label>
            </div>
            <TextInput
              id="password"
              type="password"
              required
              icon={HiLockClosed}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-2">
            <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800 font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary-400"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </Card>
    </div>
  );
}