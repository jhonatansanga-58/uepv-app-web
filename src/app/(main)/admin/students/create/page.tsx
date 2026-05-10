"use client";

import { useState, useEffect } from "react";
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
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const studentSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras").max(50, "Máximo 50 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras").max(50, "Máximo 50 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().regex(/^\d+$/, "Solo dígitos numéricos").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  birthDate: z.string().min(1, "Seleccione la fecha de nacimiento"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  courseId: z.string().min(1, "Seleccione un curso"),
  parallelId: z.string().min(1, "Seleccione un paralelo"),
  tutorId: z.string().optional().or(z.literal("")),
}).refine(data => {
   if(!data.birthDate) return true;
   const d = new Date(data.birthDate);
   const age = new Date().getFullYear() - d.getFullYear();
   return age >= 3 && age <= 22;
}, {
   message: "El estudiante debe tener entre 3 y 22 años",
   path: ["birthDate"]
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface Course { id: number; name: string; }
interface Parallel { id: number; name: string; }
interface Tutor { id: number; firstName: string; lastName: string; }

export default function CreateStudentForm() {
  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      birthDate: "",
      // @ts-ignore
      gender: "",
      courseId: "",
      parallelId: "",
      tutorId: "",
    }
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [parallels, setParallels] = useState<Parallel[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [scannerResetKey, setScannerResetKey] = useState<number>(0);
  const [credentialsData, setCredentialsData] = useState<{userName: string, rawPassword: string} | null>(null);
  
  const [fingerprintBase64, setFingerprintBase64] = useState("");

  const selectedCourseId = watch("courseId");

  useEffect(() => {
    fetch("/api/courses").then((res) => res.json()).then(setCourses);
    fetch("/api/tutors").then((res) => res.json()).then(setTutors);
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;

    fetch(`/api/courses/${selectedCourseId}/parallels`)
      .then((res) => res.json())
      .then((data) => setParallels(data))
      .catch((err) => console.error("Error cargando paralelos:", err));
  }, [selectedCourseId]);

  const onSubmit = async (data: StudentFormValues) => {
    if (!fingerprintBase64) {
      toast.warning("Debe completar el enrolamiento biométrico.");
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, fingerprintBase64 }),
      });

      if (res.ok) {
        toast.success("Estudiante registrado con éxito.");
        reset();
        setFingerprintBase64(""); 
        
        const responseData = await res.json();
        if (responseData.user?.userName && responseData.rawPassword) {
            setCredentialsData({ userName: responseData.user.userName, rawPassword: responseData.rawPassword });
        }

        setScannerResetKey(prev => prev + 1);
        
      } else {
        const errData = await res.json();
        toast.error("Error: " + (errData.error || "Operación fallida"));
      }
    } catch (error) {
      toast.error("Problema de red o servidor.");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />
      
      <Card className="max-w-4xl mx-auto my-8">
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit(onSubmit as any)}
        >
          <div>
            <Label>Nombre</Label>
            <TextInput
              {...register("firstName")}
            />
            {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName.message}</span>}
          </div>
          <div>
            <Label>Apellido</Label>
            <TextInput
              {...register("lastName")}
            />
            {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName.message}</span>}
          </div>
          <div>
            <Label>Email</Label>
            <TextInput
              {...register("email")}
              type="email"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          <div>
            <Label>Teléfono</Label>
            <TextInput
              {...register("phone")}
            />
            {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
          </div>
          <div>
            <Label>Dirección</Label>
            <TextInput
              {...register("address")}
            />
            {errors.address && <span className="text-red-500 text-sm">{errors.address.message}</span>}
          </div>
          <div>
            <Label>Fecha de nacimiento</Label>
            <Controller
               control={control}
               name="birthDate"
               render={({ field }) => (
                 <Datepicker
                   value={field.value ? new Date(field.value) : undefined}
                   onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                 />
               )}
            />
            {errors.birthDate && <span className="text-red-500 text-sm">{errors.birthDate.message}</span>}
          </div>
          <div>
            <Label>Género</Label>
            <Select {...register("gender")}>
              <option value="">Seleccione...</option>
              <option value="MALE">Masculino</option>
              <option value="FEMALE">Femenino</option>
              <option value="OTHER">Otro</option>
            </Select>
            {errors.gender && <span className="text-red-500 text-sm">{errors.gender.message}</span>}
          </div>

          <div>
            <Label>Curso</Label>
            <Select
              {...register("courseId")}
            >
              <option value="">Seleccione...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {errors.courseId && <span className="text-red-500 text-sm">{errors.courseId.message}</span>}
          </div>
          <div>
            <Label>Paralelo</Label>
            <Select
              {...register("parallelId")}
            >
              <option value="">Seleccione...</option>
              {parallels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            {errors.parallelId && <span className="text-red-500 text-sm">{errors.parallelId.message}</span>}
          </div>
          <div className="md:col-span-2">
            <Label>Tutor</Label>
            <Select
              {...register("tutorId")}
            >
              <option value="">Sin tutor asignado</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </Select>
            {errors.tutorId && <span className="text-red-500 text-sm">{errors.tutorId.message}</span>}
          </div>
          
          <div className="md:col-span-2 mt-4">
            <Label className="mb-2 block">Autenticación Biométrica (Requerido)</Label>
            <FingerprintScanner 
              key={scannerResetKey} 
              onCapture={(base64) => {
                 setFingerprintBase64(base64);
              }} 
            />
          </div>

          <div className="md:col-span-2 text-right mt-6">
            <Button 
                type="submit" 
                className="ml-auto"
                color="blue"
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
