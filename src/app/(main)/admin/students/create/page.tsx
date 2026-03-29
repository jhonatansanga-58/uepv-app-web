"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Label,
  TextInput,
  Button,
  Select,
  Datepicker,
  Card,
} from "flowbite-react";

// Define types for your data
interface Course {
  id: number;
  name: string;
}
interface Parallel {
  id: number;
  name: string;
}
interface Tutor {
  id: number;
  firstName: string;
  lastName: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: string;
  courseId: string;
  parallelId: string;
  tutorId: string;
}

export default function CreateStudentForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: "",
    courseId: "",
    parallelId: "",
    tutorId: "",
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [parallels, setParallels] = useState<Parallel[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then(setCourses);
    fetch("/api/tutors")
      .then((res) => res.json())
      .then(setTutors);
  }, []);

  useEffect(() => {
    if (!formData.courseId) return;

    fetch(`/api/courses/${formData.courseId}/parallels`)
      .then((res) => res.json())
      .then((data) => setParallels(data))
      .catch((err) => console.error("Error cargando paralelos:", err));
  }, [formData.courseId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      birthDate: date ? date.toISOString().split("T")[0] : "",
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      alert("Estudiante registrado con éxito");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        birthDate: "",
        gender: "",
        courseId: "",
        parallelId: "",
        tutorId: "",
      });
    } else {
      const data = await res.json();
      alert("Error: " + (data.error || "Error desconocido"));
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
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Apellido</Label>
          <TextInput
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Email</Label>
          <TextInput
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            required
          />
        </div>
        <div>
          <Label>Contraseña</Label>
          <TextInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            required
          />
        </div>
        <div>
          <Label>Teléfono</Label>
          <TextInput
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Dirección</Label>
          <TextInput
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Fecha de nacimiento</Label>
          <Datepicker
            value={
              formData.birthDate ? new Date(formData.birthDate) : undefined
            }
            onChange={handleDateChange}
          />
        </div>
        <div>
          <Label>Género</Label>
          <Select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Seleccione...</option>
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Femenino</option>
            <option value="OTHER">Otro</option>
          </Select>
        </div>

        <div>
          <Label>Curso</Label>
          <Select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Paralelo</Label>
          <Select
            name="parallelId"
            value={formData.parallelId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            {parallels.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Tutor</Label>
          <Select
            name="tutorId"
            value={formData.tutorId}
            onChange={handleChange}
          >
            <option value="">Sin tutor asignado</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:col-span-2 text-right">
          <Button type="submit">Registrar estudiante</Button>
        </div>
      </form>
    </Card>
  );
}
