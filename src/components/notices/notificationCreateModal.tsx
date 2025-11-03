"use client";

import { Modal, Button, Label, TextInput, Select, Radio } from "flowbite-react";
import { useEffect, useState } from "react";

type Course = {
  id: number;
  name: string;
  parallels: {
    id: number;
    name: string;
  }[];
};

type User = {
  id: number;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function NotificationCreateModal({ open, onClose, onCreated }: Props) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    destinataryType: "all", // 'all' | 'course' | 'user'
    userId: null as number | null,
    courseParallelId: null as number | null,
  });

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isUserSelected, setIsUserSelected] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Fetch courses when modal opens
    fetch("/api/courses/all")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Error loading courses:", err));

    // Fetch users for the search functionality
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
    const results = users
      .filter((u) => u.name.toLowerCase().includes(q))
      .slice(0, 20);
    setFilteredUsers(results);
  }, [query, users]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Reset related fields when changing destinatary type
      if (name === "destinataryType") {
        newData.userId = null;
        newData.courseParallelId = null;
        setQuery("");
        setFilteredUsers([]);
      }

      return newData;
    });
  };

  const handleSelectUser = (user: User) => {
    setFormData((prev) => ({ ...prev, userId: user.id }));
    setQuery(user.name);
    setFilteredUsers([]);
    setIsUserSelected(true);
  };

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsUserSelected(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await fetch("/api/notices/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setLoading(false);
      onCreated();
      onClose();
    } catch (err) {
      console.error("Error al crear", err);
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="lg">
      <div className="p-6">
        <h3 className="text-xl font-medium text-gray-900 mb-4">
          Nuevo Comunicado
        </h3>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <form className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <TextInput
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Mensaje</Label>
                <TextInput
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Destinatario</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center">
                    <Radio
                      id="all"
                      name="destinataryType"
                      value="all"
                      checked={formData.destinataryType === "all"}
                      onChange={handleChange}
                    />
                    <Label htmlFor="all" className="ml-2">
                      Todos los usuarios
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Radio
                      id="course"
                      name="destinataryType"
                      value="course"
                      checked={formData.destinataryType === "course"}
                      onChange={handleChange}
                    />
                    <Label htmlFor="course" className="ml-2">
                      Un curso
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Radio
                      id="user"
                      name="destinataryType"
                      value="user"
                      checked={formData.destinataryType === "user"}
                      onChange={handleChange}
                    />
                    <Label htmlFor="user" className="ml-2">
                      Un usuario
                    </Label>
                  </div>
                </div>
              </div>

              {formData.destinataryType === "course" && (
                <div>
                  <Label htmlFor="courseParallelId">Seleccionar curso</Label>
                  <Select
                    id="courseParallelId"
                    name="courseParallelId"
                    value={formData.courseParallelId || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar curso...</option>
                    {courses.map((course) =>
                      course.parallels.map((parallel) => (
                        <option key={parallel.id} value={parallel.id}>
                          {course.name} {parallel.name}
                        </option>
                      ))
                    )}
                  </Select>
                </div>
              )}

              {formData.destinataryType === "user" && (
                <div>
                  <Label htmlFor="userSearch">Buscar usuario</Label>
                  <div className="relative">
                    <TextInput
                      id="userSearch"
                      value={query}
                      onChange={handleUserSearch}
                      placeholder="Escriba el nombre del usuario..."
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
              )}
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