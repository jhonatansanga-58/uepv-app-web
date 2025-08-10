"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Label, Select, TextInput } from "flowbite-react";

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT",
    phone: "",
    address: "",
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear el usuario");
      } else {
        setSuccess("Usuario creado correctamente");
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          role: "",
          phone: "",
          address: "",
          active: true,
        });
        alert("Usuario creado correctamente");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto my-8">
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleSubmit}
      >
        <div>
          <Label>Nombre</Label>
          <TextInput
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Apellido</Label>
          <TextInput
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Email</Label>
          <TextInput
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            required
          />
        </div>
        <div>
          <Label>Contraseña</Label>
          <TextInput
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            required
          />
        </div>
        <div>
          <Label>Teléfono</Label>
          <TextInput name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <Label>Dirección</Label>
          <TextInput
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Rol</Label>
          <Select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            <option value="ADMIN">Administrador</option>{" "}
            <option value="TEACHER">Docente</option>
            <option value="TUTOR">Padre</option>
            <option value="STUDENT">Estudiante</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Activo</Label>
          <input
            type="checkbox"
            name="isActive"
            checked={form.active}
            onChange={handleChange}
            className="ml-2"
          />
        </div>
        <div className="md:col-span-2 text-right">
          <Button type="submit">Registrar usuario</Button>
        </div>
      </form>
    </Card>
  );
}
