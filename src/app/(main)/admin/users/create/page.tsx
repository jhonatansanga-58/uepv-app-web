"use client";

import { useState } from "react";
import { Card, Button, Label, TextInput, Select, Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { HiUserGroup, HiClipboardCopy, HiDownload, HiMail, HiChat } from "react-icons/hi";
import AssignStudentsModal from "@/components/assignStudentsModal";
import AssignSubjectsModal from "@/components/assignSubjectsModal";

import { jsPDF } from "jspdf";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras").max(50, "Máximo 50 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras").max(50, "Máximo 50 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().regex(/^\d{7,10}$/, "Debe contener entre 7 y 10 dígitos numéricos").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  role: z.enum(["ADMIN", "TEACHER", "TUTOR"])
});

type UserFormValues = z.infer<typeof userSchema>;

export default function CreateUserPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      // @ts-ignore
      role: "",
    }
  });

  const [openStudents, setOpenStudents] = useState(false);
  const [openSubjects, setOpenSubjects] = useState(false);
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
    const { userName, rawPassword, firstName, lastName, email, phone, role } = credentialsData;

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
    doc.text("COMPROBANTE DE REGISTRO DE USUARIO", 20, 42);

    // Date
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString("es-ES")}`, 20, 48);

    // User Details Box
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 55, 170, 45, "F");

    doc.setFont("Helvetica", "bold");
    doc.text("Datos del Usuario:", 25, 62);
    doc.setFont("Helvetica", "normal");
    doc.text(`Nombre Completo: ${firstName} ${lastName}`, 25, 70);
    doc.text(`Rol: ${role === "ADMIN" ? "Administrador" : role === "TEACHER" ? "Docente" : "Tutor"}`, 25, 77);
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
    doc.save(`Credenciales_${firstName}_${lastName}.pdf`);
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
          role: credentialsData.role,
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
    const message = `*Unidad Educativa Plenitud de Vida*\n\nEstimado(a) *${firstName} ${lastName}*, le compartimos sus credenciales de acceso al Portal Académico:\n\n*Usuario:* ${userName}\n*Contraseña temporal:* ${rawPassword}\n\n*Acceso:* http://localhost:3000\n\n_*Nota:* El sistema le solicitará cambiar su contraseña al ingresar por primera vez._`;
    const cleanPhone = credentialsData.phone.replace(/\D/g, ""); // leave only digits
    return `https://wa.me/591${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  const [createdRole, setCreatedRole] = useState<"TUTOR" | "TEACHER" | "OTHER">("OTHER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, active: true }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setError(resData.error || "Error al crear el usuario");
      } else {
        setSuccess("Usuario creado correctamente");
        reset();

        setCreatedUserId(resData.id);
        setCreatedRole(resData.role);

        // Mostrar credenciales automáticamente
        if (resData.userName && resData.rawPassword) {
          setCredentialsData({
            userName: resData.userName,
            rawPassword: resData.rawPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || undefined,
            role: data.role
          });
        }
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const closeCredentialsModal = () => {
    setCredentialsData(null);
    if (createdRole === "TUTOR") setOpenStudents(true);
    else if (createdRole === "TEACHER") setOpenSubjects(true);
  };

  async function saveStudentAssignments(studentIds: number[]) {
    const res = await fetch(`/api/users/${createdUserId}/students`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Error assigning students:", data.error);
      setError(data.error || "Error al asignar estudiantes");
    }
  }

  async function saveSubjectAssignments(subjectIds: number[]) {
    const res = await fetch(`/api/users/${createdUserId}/subjects`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectIds }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Error assigning sunjects:", data.error);
      setError(data.error || "Error al asignar materias");
    }
  }

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
            <Label>Rol</Label>
            <Select
              {...register("role")}
            >
              <option value="">Seleccione...</option>
              <option value="ADMIN">Administrador</option>{" "}
              <option value="TEACHER">Docente</option>
              <option value="TUTOR">Padre</option>
            </Select>
            {errors.role && <span className="text-red-500 text-sm">{errors.role.message}</span>}
          </div>

          <div className="md:col-span-2 text-right">
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar usuario"}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-2 text-red-600 text-sm mb-2">
              {error}
            </div>
          )}
          {success && (
            <div className="md:col-span-2 text-green-600 text-sm mb-2">
              {success}
            </div>
          )}
        </form>
      </Card>
      {createdUserId && createdRole === "TUTOR" && (
        <AssignStudentsModal
          isOpen={openStudents}
          onClose={() => setOpenStudents(false)}
          userId={createdUserId}
          isNew={true}
          onConfirm={saveStudentAssignments}
        />
      )}
      {createdUserId && createdRole === "TEACHER" && (
        <AssignSubjectsModal
          isOpen={openSubjects}
          onClose={() => setOpenSubjects(false)}
          userId={createdUserId}
          isNew={true}
          onConfirm={saveSubjectAssignments}
        />
      )}

      {/* MODAL DE CREDENCIALES GENERADAS */}
      <Modal show={!!credentialsData} onClose={closeCredentialsModal} size="md">
        <ModalHeader>¡Usuario Creado Exitosamente!</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Entregue estas credenciales iniciales al usuario. El sistema le pedirá que actualice su contraseña en su primer inicio de sesión.
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
          <Button onClick={closeCredentialsModal} color="success">
            Comprendido
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
