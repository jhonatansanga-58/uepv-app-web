"use client";

import { useState, useEffect } from "react";
import AcademicYearCard from "@/components/academicYearCard";
import AcademicYearActivateModal from "@/components/academicYearActivateModal";
import { toast } from "react-toastify";

interface AcademicYear {
  id: number;
  year: number;
  active: boolean;
}

export default function AcademicYearsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [nextTempId, setNextTempId] = useState(-1);
  const [openActivateModal, setOpenActivateModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<{ id: number; year: number } | null>(null);

  const fetchAcademicYears = async () => {
    try {
      const res = await fetch("/api/academic-years");
      if (res.ok) {
        const data = await res.json();
        setAcademicYears(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleAddNewYear = () => {
    setAcademicYears((prev) => [
      {
        id: nextTempId,
        year: new Date().getFullYear(),
        active: false,
      },
      ...prev,
    ]);
    setNextTempId((prev) => prev - 1);
  };

  const handleUpdateYear = async (
    id: number,
    data: { year: number }
  ) => {
    if (!data.year || data.year < 2000 || data.year > 2100) {
      toast.error("El año académico es inválido.");
      return;
    }

    if (id < 0) {
      try {
        // Create new academic year
        const res = await fetch("/api/academic-years", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year: data.year }),
        });
        const resData = await res.json();
        if (res.ok) {
          toast.success(`¡La gestión académica ${data.year} se ha creado con éxito!`);
          fetchAcademicYears();
        } else {
          toast.error(resData.error || "Error al crear la gestión académica.");
          // If it fails, reload anyway to remove the temp item
          fetchAcademicYears();
        }
      } catch (err) {
        toast.error("Error de red al guardar la nueva gestión académica.");
        fetchAcademicYears();
      }
    }
  };

  const handleOpenActivateModal = (id: number) => {
    const ay = academicYears.find(y => y.id === id);
    if (ay) {
      setSelectedYear({
        id: ay.id,
        year: ay.year,
      });
      setOpenActivateModal(true);
    }
  };

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Organización: Gestiones (Años Académicos)</h1>
        <button
          onClick={handleAddNewYear}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
        >
          Nueva gestión
        </button>
      </div>

      <div className="space-y-3">
        {academicYears.map((ay) => (
          <AcademicYearCard
            key={ay.id}
            id={ay.id}
            year={ay.year}
            active={ay.active}
            startEditing={ay.id < 0}
            onUpdate={handleUpdateYear}
            onActivate={handleOpenActivateModal}
          />
        ))}

        {academicYears.length === 0 && (
          <p className="text-gray-500 italic mt-4">No hay gestiones registradas.</p>
        )}
      </div>

      <AcademicYearActivateModal
        id={selectedYear?.id || null}
        year={selectedYear?.year || 0}
        open={openActivateModal}
        onClose={() => setOpenActivateModal(false)}
        onUpdated={fetchAcademicYears}
      />
    </div>
  );
}
