"use client";

import { Button, Card, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { HiLockClosed } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { toast } from "react-toastify";

export default function ForceChangePasswordPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      const msg = "Las contraseñas no coinciden.";
      setError(msg);
      toast.error(msg);
      setNewPassword("");
      setConfirmPassword("");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      const msg = "La contraseña debe tener al menos 8 caracteres para cumplir con las políticas de seguridad.";
      setError(msg);
      toast.error(msg);
      setNewPassword("");
      setConfirmPassword("");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || "Error al actualizar la contraseña.";
        setError(errorMsg);
        toast.error(errorMsg);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setSuccess("Contraseña actualizada con éxito. Inicia sesión nuevamente con la nueva clave.");
        toast.success("¡Contraseña actualizada con éxito! Redirigiendo para iniciar sesión...");
        setNewPassword("");
        setConfirmPassword("");
        // Reforzamos cerrando la sesión sucia (que tenía la bandera forcePasswordChange encendida) 
        // para que entre limpiecito con la nueva
        setTimeout(() => {
           signOut({ callbackUrl: '/login' });
        }, 2500);
      }
    } catch {
      const errorMsg = "Ocurrió un error de conexión. Intenta de nuevo.";
      setError(errorMsg);
      toast.error(errorMsg);
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          Actualización Requerida
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6 px-4">
          Por seguridad institucional, debes cambiar tu contraseña predeterminada antes de continuar hacia el sistema.
        </p>

        {success ? (
           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
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
              {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
