"use client";

import { Button, Card, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { HiMail } from "react-icons/hi";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al enviar la solicitud.");
      } else {
        setSuccess(data.message);
        setEmail("");
      }
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          Recuperar Contraseña
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6 px-4">
          Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un enlace de recuperación.
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
                <Label htmlFor="email">Correo Electrónico</Label>
              </div>
              <TextInput
                id="email"
                type="email"
                required
                icon={HiMail}
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {isLoading ? "Enviando..." : "Enviar Enlace"}
            </Button>
            
            <div className="text-center mt-4">
              <a href="/login" className="text-sm text-primary-600 hover:text-primary-800 font-medium">Volver a inicio de sesión</a>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
