"use client";

import React, { useEffect, useState } from "react";
import { TextInput, Spinner } from "flowbite-react";
import AttendanceConfirmModal from "@/components/attendanceConfirmModal";

type StudentMinimal = { id: number; label: string };

export default function RegisterAttendancePage() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<StudentMinimal[]>([]);
  const [filtered, setFiltered] = useState<StudentMinimal[]>([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState<StudentMinimal | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // fetch list once
    let mounted = true;
    setLoading(true);
    fetch('/api/students/allminimal')
      .then(res => res.json())
      .then((data) => {
        if (!mounted) return;
        setStudents(data || []);
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered([]);
      return;
    }
    const results = students.filter(s => s.label.toLowerCase().includes(q)).slice(0, 20);
    setFiltered(results);
  }, [query, students]);

  const handleSelect = (s: StudentMinimal) => {
    setSelected(s);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selected.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Error registering attendance', err);
      } else {
        // success: reset input and close modal
        setQuery('');
        setFiltered([]);
        setShowConfirm(false);
        setSelected(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">Registrar Asistencia</h2>

      <div className="mb-4">
        <TextInput
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="Buscar estudiante por nombre, curso o paralelo..."
        />
      </div>

      {loading ? (
        <div className="flex justify-center"><Spinner /></div>
      ) : (
        <div className="bg-white border rounded p-2 max-h-72 overflow-y-auto">
          {query === "" ? (
            <div className="text-sm text-gray-500">Escriba para buscar estudiantes</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500">No se encontraron coincidencias</div>
          ) : (
            <ul>
              {filtered.map(s => (
                <li
                  key={s.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(s)}
                >
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selected && (
        <AttendanceConfirmModal
          show={showConfirm}
          onClose={() => setShowConfirm(false)}
          studentLabel={selected.label}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
