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
import { HiClipboardCopy, HiDownload, HiMail, HiChat } from "react-icons/hi";
import FingerprintScanner from "@/components/FingerprintScanner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jsPDF } from "jspdf";

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
  if (!data.birthDate) return true;
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
  const [credentialsData, setCredentialsData] = useState<{
    userName: string;
    rawPassword: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
  } | null>(null);

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error", message: string } | null>(null);

  const downloadPDF = () => {
    if (!credentialsData) return;
    const { userName, rawPassword, firstName, lastName, email, phone } = credentialsData;

    const doc = new jsPDF();

    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(132, 45, 156); // #842d9c
    doc.text("UNIDAD EDUCATIVA \"PLENITUD DE VIDA\"", 105, 20, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Portal Académico UEPV - Credenciales de Acceso", 105, 26, { align: "center" });

    // Draw line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 32, 190, 32);

    // Title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("COMPROBANTE DE MATRICULACIÓN DE ESTUDIANTE", 20, 42);

    // Date
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString("es-ES")}`, 20, 48);

    // User Details Box
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 55, 170, 45, "F");

    doc.setFont("Helvetica", "bold");
    doc.text("Datos del Estudiante:", 25, 62);
    doc.setFont("Helvetica", "normal");
    doc.text(`Nombre Completo: ${firstName} ${lastName}`, 25, 70);
    doc.text("Rol: Estudiante", 25, 77);
    doc.text(`Correo Electrónico: ${email}`, 25, 84);
    if (phone) {
      doc.text(`Teléfono: ${phone}`, 25, 91);
    }

    // Credentials Box
    doc.setFillColor(249, 241, 251); // #f9f1fb
    doc.rect(20, 107, 170, 35, "F");

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(132, 45, 156);
    doc.text("CREDENCIALES DE ACCESO TEMPORAL:", 25, 115);

    doc.setFont("Courier", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Usuario:    ${userName}`, 25, 124);
    doc.text(`Contraseña: ${rawPassword}`, 25, 131);

    // Instructions
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Instrucciones de ingreso:", 20, 152);

    let y = 159;
    const instructions = [
      "1. Ingrese a la dirección web del portal: http://localhost:3000 (o la URL provista por el colegio).",
      "2. Digite su Nombre de Usuario y Contraseña Temporal.",
      "3. Por motivos de seguridad, el sistema le obligará a actualizar su contraseña al ingresar.",
      "4. Mantenga estas credenciales bajo estricta confidencialidad."
    ];

    instructions.forEach(line => {
      doc.text(line, 20, y);
      y += 7;
    });

    // Footer signature line
    doc.line(60, 230, 150, 230);
    doc.text("Firma o Sello Autorizado", 105, 236, { align: "center" });

    // Save PDF
    doc.save(`Credenciales_Estudiante_${firstName}_${lastName}.pdf`);
  };

  const sendEmail = async () => {
    if (!credentialsData) return;
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/users/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentialsData.email,
          name: `${credentialsData.firstName} ${credentialsData.lastName}`,
          userName: credentialsData.userName,
          rawPassword: credentialsData.rawPassword,
          role: "STUDENT",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailStatus({ type: "success", message: "Credenciales enviadas al correo con éxito." });
      } else {
        setEmailStatus({ type: "error", message: data.error || "Fallo al enviar correo." });
      }
    } catch {
      setEmailStatus({ type: "error", message: "Error al conectar con el servidor." });
    } finally {
      setSendingEmail(false);
    }
  };

  const getWhatsAppLink = () => {
    if (!credentialsData || !credentialsData.phone) return "#";
    const { userName, rawPassword, firstName, lastName } = credentialsData;
    const message = `*Unidad Educativa Plenitud de Vida*\n\nEstimado(a) estudiante *${firstName} ${lastName}*, le compartimos sus credenciales de acceso al Portal Académico:\n\n*Usuario:* ${userName}\n*Contraseña temporal:* ${rawPassword}\n\n*Acceso:* http://localhost:3000\n\n_Nota: El sistema le solicitará cambiar su contraseña al ingresar por primera vez._`;
    const cleanPhone = credentialsData.phone.replace(/\D/g, ""); // leave only digits
    return `https://wa.me/591${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

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
        const responseData = await res.json();
        const studentName = `${responseData.user?.firstName || ""} ${responseData.user?.lastName || ""}`.trim();
        toast.success(`¡El estudiante "${studentName || data.firstName}" se ha creado con éxito!`);
        reset();
        setFingerprintBase64("");

        if (responseData.user?.userName && responseData.rawPassword) {
          setCredentialsData({
            userName: responseData.user.userName,
            rawPassword: responseData.rawPassword,
            firstName: responseData.user.firstName,
            lastName: responseData.user.lastName,
            email: responseData.user.email,
            phone: responseData.user.phone || undefined,
            role: "STUDENT"
          });
        }

        setScannerResetKey(prev => prev + 1);

      } else {
        const errData = await res.json();
        toast.error(`Error al registrar el estudiante: ${errData.error || "Operación fallida"}`);
      }
    } catch (error) {
      toast.error("Ocurrió un problema de conexión con el servidor.");
    }
  };

  return (
    <>
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
                  value={field.value ? (() => {
                    const [y, m, d] = field.value.split("-").map(Number);
                    return new Date(y, m - 1, d, 12, 0, 0);
                  })() : undefined}
                  onChange={(date) => {
                    if (date) {
                      const adjusted = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        12, 0, 0
                      );
                      field.onChange(adjusted.toISOString().split("T")[0]);
                    } else {
                      field.onChange("");
                    }
                  }}
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

            {/* Opciones de Comunicación de Credenciales */}
            <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
              <Label className="text-xs text-gray-400 uppercase tracking-widest block mb-2">Compartir o Entregar</Label>

              <div className="grid grid-cols-1 gap-2">
                <Button color="light" size="sm" className="flex items-center justify-center gap-2" onClick={downloadPDF}>
                  <HiDownload className="w-4 h-4" />
                  Descargar Comprobante PDF
                </Button>

                <Button
                  color="purple"
                  size="sm"
                  className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white"
                  onClick={sendEmail}
                  disabled={sendingEmail}
                >
                  <HiMail className="w-4 h-4" />
                  {sendingEmail ? "Enviando Correo..." : "Enviar por Correo Electrónico"}
                </Button>

                {credentialsData?.phone && (
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-4 py-2 text-center"
                  >
                    <HiChat className="w-4 h-4 mr-2" />
                    Enviar por WhatsApp
                  </a>
                )}
              </div>

              {emailStatus && (
                <div className={`text-xs mt-2 text-center ${emailStatus.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {emailStatus.message}
                </div>
              )}
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
