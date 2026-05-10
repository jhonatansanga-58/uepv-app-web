"use client";

import { useState } from "react";
import { Button, Card, Label, Select, TextInput, Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import AssignStudentsModal from "@/components/assignStudentsModal";
import AssignSubjectsModal from "@/components/assignSubjectsModal";
import { HiClipboardCopy } from "react-icons/hi";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const [credentialsData, setCredentialsData] = useState<{userName: string, rawPassword: string} | null>(null);

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
        if(resData.userName && resData.rawPassword) {
           setCredentialsData({ userName: resData.userName, rawPassword: resData.rawPassword });
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
