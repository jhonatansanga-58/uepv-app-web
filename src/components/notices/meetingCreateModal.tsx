"use client";

import { Modal, Button, Label, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!open) return;

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
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectUser = (user: UserMinimal) => {
    setFormData((prev) => ({ ...prev, studentId: user.id }));
    setQuery(user.name);
    setFilteredUsers([]);
    setIsUserSelected(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!formData.studentId) {
        // simple client-side guard
        setLoading(false);
        return;
      }

      await fetch("/api/notices/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          topic: formData.topic,
          message: formData.message,
        }),
      });

      setLoading(false);
      onCreated();
      onClose();
    } catch (err) {
      console.error("Error creating meeting", err);
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="lg">
      <div className="p-6">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Nueva Reunión</h3>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <form className="space-y-4">
            <div>
              <Label htmlFor="topic">Tema</Label>
              <TextInput id="topic" name="topic" value={formData.topic} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="message">Mensaje</Label>
              <TextInput id="message" name="message" value={formData.message} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="userSearch">Buscar destinatario (tutor o estudiante)</Label>
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
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>Crear</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
