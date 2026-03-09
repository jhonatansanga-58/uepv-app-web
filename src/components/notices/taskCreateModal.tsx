"use client";

import { Modal, Button, Label, TextInput, Select } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Subject = {
  id: number;
  name: string;
};

type CourseParallel = {
  id: number;
  label: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function TaskCreateModal({ open, onClose, onCreated }: Props) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    courseParallelId: "",
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courseParallels, setCourseParallels] = useState<CourseParallel[]>([]);
  const { data: session } = useSession();

  const userId = session?.user?.id;
  useEffect(() => {
    if (!open) return;

    // Fetch teacher's subjects when modal opens
    fetch(`/api/subjects/minimal?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setSubjects(data.assigned))
      .catch((err) => console.error("Error loading subjects:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubjectChange = async (subjectId: string) => {
    setFormData((prev) => ({ ...prev, subjectId, courseParallelId: "" }));

    if (!subjectId) {
      setCourseParallels([]);
      return;
    }

    try {
      const res = await fetch(`/api/notices/tasks/subject-courses/${subjectId}`);
      const data = await res.json();
      setCourseParallels(data);
    } catch (err) {
      console.error("Error loading course parallels:", err);
      setCourseParallels([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "subjectId") {
      handleSubjectChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await fetch("/api/notices/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subjectId: parseInt(formData.subjectId),
          courseParallelId: parseInt(formData.courseParallelId),
        }),
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
          Nueva Tarea
        </h3>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <form className="space-y-4">
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
              <Label htmlFor="description">Descripción</Label>
              <TextInput
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="subjectId">Asignatura</Label>
              <Select
                id="subjectId"
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar asignatura...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
            </div>

            {formData.subjectId && (
              <div>
                <Label htmlFor="courseParallelId">Curso</Label>
                <Select
                  id="courseParallelId"
                  name="courseParallelId"
                  value={formData.courseParallelId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar curso...</option>
                  {courseParallels.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="dueDate">Fecha de entrega</Label>
              <TextInput
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
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