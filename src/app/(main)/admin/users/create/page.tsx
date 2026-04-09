"use client";

import { useState } from "react";
import { Button, Card, Label, Select, TextInput, Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import AssignStudentsModal from "@/components/assignStudentsModal";
import AssignSubjectsModal from "@/components/assignSubjectsModal";
import { HiClipboardCopy } from "react-icons/hi";

export default function CreateUserPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    active: true,
  });

  const [openStudents, setOpenStudents] = useState(false);
  const [openSubjects, setOpenSubjects] = useState(false);
  const [credentialsData, setCredentialsData] = useState<{userName: string, rawPassword: string} | null>(null);

  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  const [createdRole, setCreatedRole] = useState<"TUTOR" | "TEACHER" | "OTHER">("OTHER");

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
          role: "",
          phone: "",
          address: "",
          active: true,
        });

        setCreatedUserId(data.id);
        setCreatedRole(data.role);
        
        // Mostrar credenciales automáticamente
        if(data.userName && data.rawPassword) {
           setCredentialsData({ userName: data.userName, rawPassword: data.rawPassword });
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
            <Label>Teléfono</Label>
            <TextInput
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
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
            </Select>
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
