"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Label,
  TextInput,
  Button,
  Select,
  Datepicker,
  Card,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "flowbite-react";
import { HiClipboardCopy } from "react-icons/hi";
import FingerprintScanner from "@/components/FingerprintScanner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  phone: string;
  address: string;
  birthDate: string;
  gender: string;
  courseId: string;
  parallelId: string;
  tutorId: string;
  fingerprintBase64?: string;
}

export default function CreateStudentForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: "",
    courseId: "",
    parallelId: "",
    tutorId: "",
    fingerprintBase64: "",
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [parallels, setParallels] = useState<Parallel[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [scannerResetKey, setScannerResetKey] = useState<number>(0);
  const [credentialsData, setCredentialsData] = useState<{userName: string, rawPassword: string} | null>(null);

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

    if (!formData.fingerprintBase64) {
      toast.warning("Debe completar el enrolamiento de las 4 huellas biométricas primero.");
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Estudiante y Huella registrados con éxito.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          birthDate: "",
          gender: "",
          courseId: "",
          parallelId: "",
          tutorId: "",
          fingerprintBase64: "", // Limpiar estado de huella
        });
        
        // Mostrar credenciales generadas
        const responseData = await res.json();
        if (responseData.user?.userName && responseData.rawPassword) {
            setCredentialsData({ userName: responseData.user.userName, rawPassword: responseData.rawPassword });
        }

        // Al forzar el cambio de la clave (key), React destruye por completo
        // el componente FingerprintScanner y lo vuelve a montar, reiniciándolo.
        setScannerResetKey(prev => prev + 1);
        
      } else {
        const data = await res.json();
        toast.error("Error: " + (data.error || "Operación fallida en la base de datos"));
      }
    } catch (error) {
      toast.error("No se pudo conectar con el servidor.");
    }
  };

  const isFormFilled = 
     formData.firstName && formData.lastName && formData.email 
     && formData.courseId && formData.parallelId;

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />
      
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
          
          <div className="md:col-span-2 mt-4">
            <Label className="mb-2 block">Autenticación Biométrica (Requerido)</Label>
            <FingerprintScanner 
              key={scannerResetKey} 
              onCapture={(base64) => {
                 setFormData(prev => ({ ...prev, fingerprintBase64: base64 }));
              }} 
            />
          </div>

          <div className="md:col-span-2 text-right mt-6">
            <Button 
                type="submit" 
                disabled={!isFormFilled || !formData.fingerprintBase64}
                className="ml-auto"
                color={!isFormFilled || !formData.fingerprintBase64 ? "light" : "blue"}
            >
              Registrar estudiante
            </Button>
          </div>
        </form>
      </Card>

      {/* MODAL DE CREDENCIALES GENERADAS */}
      <Modal show={!!credentialsData} onClose={() => setCredentialsData(null)} size="md">
        <ModalHeader>¡Estudiante Matriculado Exitosamente!</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Entregue estas credenciales iniciales al estudiante para acceder al Portal Académico. El sistema le pedirá actualizar su contraseña en su primer inicio de sesión.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="mb-2">
                <Label className="text-xs text-gray-400 uppercase tracking-widest">Nombre de Usuario</Label>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-lg font-bold text-gray-900">{credentialsData?.userName}</span>
                  <button onClick={() => navigator.clipboard.writeText(credentialsData?.userName || "")} className="text-gray-400 hover:text-primary-600">
                    <HiClipboardCopy size={20} />
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <Label className="text-xs text-gray-400 uppercase tracking-widest">Contraseña Temporal</Label>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-lg font-bold text-primary-700">{credentialsData?.rawPassword}</span>
                  <button onClick={() => navigator.clipboard.writeText(credentialsData?.rawPassword || "")} className="text-gray-400 hover:text-primary-600">
                    <HiClipboardCopy size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end">
          <Button onClick={() => setCredentialsData(null)} color="success">
            Comprendido
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
