"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label, TextInput, Select, Textarea, Button, Card, Datepicker } from "flowbite-react";
import { toast } from "react-toastify";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewLeavePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchStudents = async () => {
      try {
        const tutorId = session?.user?.id;
        if (!tutorId) return;
        const res = await fetch(`/api/tutors/${tutorId}/students`);
        if (!res.ok) throw new Error("No se pudieron cargar los estudiantes");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al cargar la lista de estudiantes.");
      }
    };
    fetchStudents();
  }, [session?.user?.id, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    // Client-side validations
    const newErrors: Record<string, string> = {};
    if (!studentId) newErrors.studentId = "Debe seleccionar un estudiante.";
    if (!title.trim()) newErrors.title = "El título de la solicitud es obligatorio.";
    if (!message.trim()) newErrors.message = "El mensaje detallado es obligatorio.";
    if (!reason.trim()) newErrors.reason = "El motivo de la licencia es obligatorio.";
    if (!startDate) newErrors.startDate = "La fecha de inicio es obligatoria.";
    if (!endDate) newErrors.endDate = "La fecha de finalización es obligatoria.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "La fecha de fin no puede ser menor que la fecha de inicio.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      toast.error("Por favor, rellena todos los campos obligatorios correctamente.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("studentId", studentId);
      formData.append("title", title);
      formData.append("message", message);
      formData.append("reason", reason);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      
      if (evidence) {
        formData.append("evidence", evidence);
      }

      const res = await fetch("/api/leaverequest", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al registrar la licencia.");
      }

      toast.success("¡La solicitud de licencia se ha enviado correctamente!");
      
      // Clear form
      setStudentId("");
      setTitle("");
      setMessage("");
      setReason("");
      setStartDate("");
      setEndDate("");
      setEvidence(null);

      router.push("/leaves/mine");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Error desconocido al procesar la solicitud.";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto my-8">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="student">Estudiante *</Label>
          <Select
            id="student"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
          >
            <option value="">Seleccione un estudiante</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </Select>
          {formErrors.studentId && <span className="text-red-500 text-sm mt-1 block">{formErrors.studentId}</span>}
        </div>
        <div>
          <Label htmlFor="title">Título *</Label>
          <TextInput
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Ausencia médica por cita dental"
          />
          {formErrors.title && <span className="text-red-500 text-sm mt-1 block">{formErrors.title}</span>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="message">Mensaje detallado *</Label>
          <Textarea
            id="message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            placeholder="Explique detalladamente la situación o el motivo de la licencia..."
          />
          {formErrors.message && <span className="text-red-500 text-sm mt-1 block">{formErrors.message}</span>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="reason">Motivo (Salud, Personal, Calamidad, etc.) *</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder="Ej: Problemas de salud del estudiante"
          />
          {formErrors.reason && <span className="text-red-500 text-sm mt-1 block">{formErrors.reason}</span>}
        </div>
        <div>
          <Label htmlFor="startDate">Fecha de inicio *</Label>
          <Datepicker
            id="startDate"
            value={startDate ? new Date(startDate) : undefined}
            onChange={date => setStartDate(date ? date.toISOString().split("T")[0] : "")}
          />
          {formErrors.startDate && <span className="text-red-500 text-sm mt-1 block">{formErrors.startDate}</span>}
        </div>
        <div>
          <Label htmlFor="endDate">Fecha de fin *</Label>
          <Datepicker
            id="endDate"
            value={endDate ? new Date(endDate) : undefined}
            onChange={date => setEndDate(date ? date.toISOString().split("T")[0] : "")}
          />
          {formErrors.endDate && <span className="text-red-500 text-sm mt-1 block">{formErrors.endDate}</span>}
        </div>
        <div className="md:col-span-2 mt-2">
          <Label htmlFor="evidence">Evidencia Adjunta (Imagen o PDF, opcional)</Label>
          <input 
            id="evidence" 
            type="file" 
            accept="image/*,application/pdf" 
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" 
            onChange={(e) => setEvidence(e.target.files?.[0] || null)} 
          />
        </div>
        <div className="md:col-span-2 text-right mt-4">
          <Button type="submit" className="bg-primary-900 hover:bg-primary-800!" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar licencia"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
