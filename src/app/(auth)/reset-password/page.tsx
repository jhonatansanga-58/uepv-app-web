"use client";

import { Button, Card, Label, TextInput } from "flowbite-react";
import { useState, Suspense } from "react";
import { HiLockClosed } from "react-icons/hi";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!token && !success && !error) {
     return (
       <div className="text-center p-6">
         <h3 className="text-red-500 font-bold mb-2">Acceso Denegado</h3>
         <p>No se encontró un token válido en la URL.</p>
         <a href="/login" className="text-primary-600 hover:text-primary-800 font-medium mt-4 inline-block">Volver a Inicio</a>
       </div>
     );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al restablecer la contraseña.");
      } else {
        setSuccess("Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión de forma segura.");
      }
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
        Restablecer Contraseña
      </h2>
      <p className="text-center text-sm text-gray-600 mb-6 px-4">
        Crea una nueva contraseña segura para tu cuenta.
      </p>

      {success ? (
         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
            <div className="mt-4 text-center">
              <a href="/login" className="text-primary-600 hover:text-primary-800 font-bold">Volver al Inicio</a>
            </div>
         </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
            </div>
            <TextInput
              id="newPassword"
              type="password"
              required
              icon={HiLockClosed}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            </div>
            <TextInput
              id="confirmPassword"
              type="password"
              required
              icon={HiLockClosed}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700"
            disabled={isLoading}
          >
            {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
          </Button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
         <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordForm />
         </Suspense>
      </Card>
    </div>
  );
}
