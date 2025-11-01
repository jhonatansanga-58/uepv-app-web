"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label, TextInput, Select, Textarea, Button, Alert, Card, Datepicker } from "flowbite-react";

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
  const [error, setError] = useState("");
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
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };
    fetchStudents();
  }, [session?.user?.id, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (!studentId || !title || !message || !reason || !startDate || !endDate) {
        setError("Todos los campos son obligatorios");
        setIsLoading(false);
        return;
      }
      const res = await fetch("/api/leaverequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, title, message, reason, startDate, endDate }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Error al registrar la licencia");
      }
      router.push("/leaves/mine");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto my-8">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="md:col-span-2 mb-2">
          {error && <Alert color="failure" className="mt-2">{error}</Alert>}
        </div>
        <div>
          <Label htmlFor="student">Estudiante</Label>
          <Select
            id="student"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            required
          >
            <option value="">Seleccione un estudiante</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="title">Título</Label>
          <TextInput
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="message">Mensaje</Label>
          <Textarea
            id="message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="reason">Motivo</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            required
          />
        </div>
        <div>
          <Label htmlFor="startDate">Fecha de inicio</Label>
          <Datepicker
            id="startDate"
            value={startDate ? new Date(startDate) : undefined}
            onChange={date => setStartDate(date ? date.toISOString().split("T")[0] : "")}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Fecha de fin</Label>
          <Datepicker
            id="endDate"
            value={endDate ? new Date(endDate) : undefined}
            onChange={date => setEndDate(date ? date.toISOString().split("T")[0] : "")}
            required
          />
        </div>
        <div className="md:col-span-2 text-right mt-4">
          <Button type="submit" className="bg-primary-400" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar licencia"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
