"use client";

import { Modal, Button, Label, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type UserMinimal = {
  id: number;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function MeetingCreateModal({ open, onClose, onCreated }: Props) {
  const [formData, setFormData] = useState({
    topic: "",
    message: "",
    studentId: null as number | null,
  });

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserMinimal[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserMinimal[]>([]);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    // Reset fields on modal open
    setFormData({
      topic: "",
      message: "",
      studentId: null,
    });
    setQuery("");
    setIsUserSelected(false);
    setErrors({});

    // Fetch tutors and students minimal list
    fetch("/api/users/minimal/tutors-students")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error loading users:", err));
  }, [open]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFilteredUsers([]);
      return;
    }
    const results = users.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 20);
    setFilteredUsers(results);
  }, [query, users]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    if (name === "userSearch") {
      setQuery(value);
      setIsUserSelected(false);
      setFormData((prev) => ({ ...prev, studentId: null }));
      if (errors.studentId) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.studentId;
          return copy;
        });
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSelectUser = (user: UserMinimal) => {
    setFormData((prev) => ({ ...prev, studentId: user.id }));
    setQuery(user.name);
    setFilteredUsers([]);
    setIsUserSelected(true);
    if (errors.studentId) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.studentId;
        return copy;
      });
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (!formData.topic.trim()) {
      newErrors.topic = "El tema es obligatorio.";
    } else if (formData.topic.trim().length < 3) {
      newErrors.topic = "El tema debe tener al menos 3 caracteres.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "El mensaje es obligatorio.";
    } else if (formData.message.trim().length < 5) {
      newErrors.message = "El mensaje debe tener al menos 5 caracteres.";
    }

    if (!formData.studentId || !isUserSelected) {
      newErrors.studentId = "Debe buscar y seleccionar un destinatario.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/notices/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          topic: formData.topic,
          message: formData.message,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Error al crear la citación.");
      }

      toast.success(`¡La citación sobre "${formData.topic}" se ha creado con éxito!`);
      setLoading(false);
      onCreated();
      onClose();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Error desconocido al crear la citación.";
      toast.error(errMsg);
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="lg">
      <div className="p-6">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Nueva Citación</h3>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <form className="space-y-4">
            <div>
              <Label htmlFor="topic">Tema *</Label>
              <TextInput id="topic" name="topic" value={formData.topic} onChange={handleChange} />
              {errors.topic && <span className="text-red-500 text-sm mt-1 block">{errors.topic}</span>}
            </div>

            <div>
              <Label htmlFor="message">Mensaje *</Label>
              <TextInput id="message" name="message" value={formData.message} onChange={handleChange} />
              {errors.message && <span className="text-red-500 text-sm mt-1 block">{errors.message}</span>}
            </div>

            <div>
              <Label htmlFor="userSearch">Buscar destinatario (tutor o estudiante) *</Label>
              <div className="relative">
                <TextInput
                  id="userSearch"
                  name="userSearch"
                  value={query}
                  onChange={handleChange}
                  placeholder="Escriba el nombre del destinatario..."
                />
                {!isUserSelected && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectUser(user)}
                      >
                        {user.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.studentId && <span className="text-red-500 text-sm mt-1 block">{errors.studentId}</span>}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-primary-900 hover:bg-primary-800!">Crear</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
