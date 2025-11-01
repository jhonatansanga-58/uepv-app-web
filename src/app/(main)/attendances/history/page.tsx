"use client";

import React, { useEffect, useState } from "react";
import { TextInput, Spinner, Button, Datepicker } from "flowbite-react";
import AttendanceDeleteConfirmModal from "@/components/attendanceDeleteConfirmModal";
import { useSession } from "next-auth/react";

type StudentMinimal = { id: number; label: string };

export default function AttendancesHistoryPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<StudentMinimal[]>([]);
  const [filtered, setFiltered] = useState<StudentMinimal[]>([]);

  const [studentId, setStudentId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [loadingList, setLoadingList] = useState(false);
  type AttendanceType = { id: number; date: string; user?: { id: number; firstName: string; lastName: string } | null };
  const [attendances, setAttendances] = useState<AttendanceType[]>([]);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    // load students depending on role
    (async () => {
      try {
        const role = session?.user?.role;
        const userId = session?.user?.id;
        if (role === 'TUTOR' && userId) {
          const res = await fetch(`/api/tutors/${userId}/students`);
          if (!res.ok) throw new Error('Error loading assigned students');
          const data = await res.json();
          // map to minimal label
          type TutorStudent = { id: number; firstName: string; lastName: string; course?: string | null; parallel?: string | null };
          const mapped = (data || []).map((s: TutorStudent) => ({
            id: s.id,
            label: `${s.firstName} ${s.lastName}${s.course ? ` - ${s.course}` : ''}${s.parallel ? ` - ${s.parallel}` : ''}`,
          }));
          if (mounted) setStudents(mapped);
        } else if (role === 'STUDENT' && userId) {
          // fetch own student info
          const res = await fetch(`/api/students/${userId}`);
          if (res.ok) {
            const s = await res.json();
            const label = `${s.user.firstName} ${s.user.lastName}${s.courseParallel?.course?.name ? ` - ${s.courseParallel.course.name}` : ''}${s.courseParallel?.parallel?.name ? ` - ${s.courseParallel.parallel.name}` : ''}`;
            if (mounted) {
              setStudents([{ id: s.id, label }]);
              setQuery(label);
              setStudentId(s.id);
            }
          }
        } else {
          const res = await fetch('/api/students/allminimal');
          const data = await res.json();
          if (mounted) setStudents(data || []);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, [session?.user?.id, session?.user?.role]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setFiltered([]); return; }
    setFiltered(students.filter(s => s.label.toLowerCase().includes(q)).slice(0, 20));
  }, [query, students]);

  const handleSelectStudent = (s: StudentMinimal) => {
    setStudentId(s.id);
    setQuery(s.label);
    setFiltered([]);
  };

  const fetchAttendances = async () => {
    if (!studentId || !fromDate || !toDate) return;
    try {
      setLoadingList(true);
      const res = await fetch(`/api/attendance?studentId=${studentId}&from=${fromDate}&to=${toDate}`);
      if (!res.ok) throw new Error('Error loading attendances');
      const data = await res.json();
      setAttendances(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingList(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/attendance/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error('Failed to delete');
      }
      // refresh
      await fetchAttendances();
    } catch (error) { console.error(error); }
    finally { setShowDeleteModal(false); setDeleteId(null); }
  };

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-2xl font-semibold mb-4">Historial de Asistencias</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="md:col-span-1">
          <label className="block text-sm text-gray-700 mb-1">Estudiante</label>
          {session?.user?.role === 'STUDENT' ? (
            <div className="p-2 bg-gray-50 rounded">{students[0]?.label || 'Estudiante'}</div>
          ) : (
            <>
              <TextInput placeholder="Buscar estudiante..." value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
              {query && filtered.length > 0 && (
                <div className="bg-white border rounded max-h-48 overflow-y-auto mt-1">
                  {filtered.map(s => (
                    <div key={s.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelectStudent(s)}>{s.label}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Desde</label>
          <Datepicker
            value={fromDate ? new Date(fromDate) : undefined}
            onChange={(d) => setFromDate(d ? (d as Date).toISOString().split("T")[0] : "")}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Hasta</label>
          <Datepicker
            value={toDate ? new Date(toDate) : undefined}
            onChange={(d) => setToDate(d ? (d as Date).toISOString().split("T")[0] : "")}
          />
        </div>
      </div>

      <div className="mb-4">
        <Button onClick={fetchAttendances} disabled={!studentId || !fromDate || !toDate}>Buscar</Button>
      </div>

      {loadingList ? (
        <div className="flex justify-center"><Spinner /></div>
      ) : (
        <div className="bg-white border rounded">
          {attendances.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No hay registros</div>
          ) : (
            <table className="w-full table-auto text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Fecha y hora</th>
                  <th className="px-4 py-2">Registrado por</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map(a => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-2">{new Date(a.date).toLocaleString()}</td>
                    <td className="px-4 py-2">{a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Dispositivo'}</td>
                    <td className="px-4 py-2">
                      <Button className="bg-red-500 hover:bg-red-600" size="sm" onClick={() => handleDeleteClick(a.id)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <AttendanceDeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
