'use client';

import { Button, Card, Label, TextInput } from 'flowbite-react';
import { useState, Suspense } from 'react';
import { HiLockClosed, HiUser } from 'react-icons/hi';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginFormContent() {
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
        console.warn('Login error:', result.error);
        
        if (result.error.includes('LOCKOUT:')) {
          const minutesLeft = result.error.split(':')[1] || '15';
          setError(`Cuenta bloqueada temporalmente por seguridad. Inténtalo de nuevo en ${minutesLeft} minuto(s).`);
        } else if (result.error.toLowerCase().includes('lockout')) {
          setError('Cuenta bloqueada temporalmente por demasiados intentos fallidos. Inténtalo en 15 minutos.');
        } else if (result.error.includes('inactive')) {
          setError('Tu usuario está inactivo. Contacta al administrador del sistema.');
        } else {
          setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        }
      }
    } catch {
      setError('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={
        <Card className="w-full max-w-md flex justify-center items-center py-12">
          <div className="text-gray-500 font-medium">Cargando...</div>
        </Card>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}