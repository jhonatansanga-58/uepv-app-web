"use client";

import { Modal, Button, Label, TextInput, Select } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: session } = useSession();

  const userId = session?.user?.id;
  useEffect(() => {
    if (!open) return;

    // Reset everything when opening modal
    setFormData({
      title: "",
      description: "",
      subjectId: "",
      courseParallelId: "",
      dueDate: "",
    });
    setErrors({});
    setCourseParallels([]);

    // Fetch teacher's subjects when modal opens
    fetch(`/api/subjects/minimal?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setSubjects(data.assigned || []))
      .catch((err) => console.error("Error loading subjects:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const handleSubjectChange = async (subjectId: string) => {
    setFormData((prev) => ({ ...prev, subjectId, courseParallelId: "" }));
    setCourseParallels([]);

    if (!subjectId) {
      return;
    }

    try {
      const res = await fetch(`/api/notices/tasks/subject-courses/${subjectId}`);
      const data = await res.json();
      setCourseParallels(data);
    } catch (err) {
      console.error("Error loading course parallels:", err);
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

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio.";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "El título debe tener al menos 3 caracteres.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria.";
    } else if (formData.description.trim().length < 5) {
      newErrors.description = "La descripción debe tener al menos 5 caracteres.";
    }

    if (!formData.subjectId) {
      newErrors.subjectId = "La asignatura es obligatoria.";
    }

    if (!formData.courseParallelId) {
      newErrors.courseParallelId = "El curso es obligatorio.";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "La fecha de entrega es obligatoria.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/notices/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subjectId: parseInt(formData.subjectId),
          courseParallelId: parseInt(formData.courseParallelId),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Error al crear la tarea.");
      }

      toast.success(`¡La tarea "${formData.title}" se ha creado con éxito!`);
      setLoading(false);
      onCreated();
      onClose();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Error desconocido al crear la tarea.";
      toast.error(errMsg);
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
              <Label htmlFor="title">Título *</Label>
              <TextInput
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <span className="text-red-500 text-sm mt-1 block">{errors.title}</span>}
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <TextInput
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && <span className="text-red-500 text-sm mt-1 block">{errors.description}</span>}
            </div>

            <div>
              <Label htmlFor="subjectId">Asignatura *</Label>
              <Select
                id="subjectId"
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
              >
                <option value="">Seleccionar asignatura...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
              {errors.subjectId && <span className="text-red-500 text-sm mt-1 block">{errors.subjectId}</span>}
            </div>

            {formData.subjectId && (
              <div>
                <Label htmlFor="courseParallelId">Curso *</Label>
                <Select
                  id="courseParallelId"
                  name="courseParallelId"
                  value={formData.courseParallelId}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar curso...</option>
                  {courseParallels.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.label}
                    </option>
                  ))}
                </Select>
                {errors.courseParallelId && <span className="text-red-500 text-sm mt-1 block">{errors.courseParallelId}</span>}
              </div>
            )}

            <div>
              <Label htmlFor="dueDate">Fecha de entrega *</Label>
              <TextInput
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleChange}
              />
              {errors.dueDate && <span className="text-red-500 text-sm mt-1 block">{errors.dueDate}</span>}
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